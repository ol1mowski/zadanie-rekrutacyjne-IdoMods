import fs from 'fs';
import path from 'path';

export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const saveJsonToFile = async <T>(
  filePath: string, 
  data: T, 
  prettify: boolean = true
): Promise<void> => {
  try {
    const dataString = prettify 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    ensureDirectoryExists(path.dirname(filePath));
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, dataString, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error(`Błąd podczas zapisywania pliku JSON do ${filePath}:`, error);
    throw error;
  }
};

export const loadJsonFromFile = async <T>(
  filePath: string, 
  defaultValue: T
): Promise<T> => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          const parsedData = JSON.parse(data) as T;
          resolve(parsedData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  } catch (error) {
    console.error(`Błąd podczas wczytywania pliku JSON z ${filePath}:`, error);
    return defaultValue;
  }
};

export const objectToCSV = <T>(
  headers: string[], 
  data: T[], 
  rowMapper: (item: T) => string[]
): string => {
  let csv = headers.join(',') + '\n';
  
  for (const item of data) {
    const values = rowMapper(item);
    csv += values.join(',') + '\n';
  }
  
  return csv;
};

export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

export const acquireFileLock = async (
  lockFilePath: string, 
  timeoutMs: number = 5000
): Promise<() => void> => {
  const startTime = Date.now();
  
  const releaseLock = () => {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }
  };
  
  ensureDirectoryExists(path.dirname(lockFilePath));
  
  while (true) {
    try {
      if (!fs.existsSync(lockFilePath)) {
        fs.writeFileSync(lockFilePath, new Date().toISOString());
        return releaseLock;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Przekroczono limit czasu oczekiwania na blokadę pliku: ${lockFilePath}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Błąd podczas uzyskiwania blokady pliku ${lockFilePath}:`, error);
      throw error;
    }
  }
}; 