import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists } from './fileUtils';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LogLevel.INFO 
  : LogLevel.DEBUG;

const LOG_DIR = path.join(__dirname, '../../../logs');

const LEVEL_VALUE = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3
};

const getFormattedDate = (): string => {
  const now = new Date();
  return now.toISOString();
};


const getLogFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}.log`;
};

export const log = (level: LogLevel, message: string, data?: any): void => {
  if (LEVEL_VALUE[level] > LEVEL_VALUE[MIN_LOG_LEVEL]) {
    return;
  }
  
  const timestamp = getFormattedDate();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(logMessage);
      if (data) console.error(data);
      break;
    case LogLevel.WARN:
      console.warn(logMessage);
      if (data) console.warn(data);
      break;
    case LogLevel.INFO:
      console.log(logMessage);
      if (data) console.log(data);
      break;
    case LogLevel.DEBUG:
      console.log(logMessage);
      if (data) console.log(data);
      break;
  }
  
  writeToLogFile(logMessage, data);
};

const writeToLogFile = (message: string, data?: any): void => {
  try {
    ensureDirectoryExists(LOG_DIR);
    const logFile = path.join(LOG_DIR, getLogFilename());
    
    let logContent = message;
    
    if (data) {
      if (typeof data === 'object') {
        logContent += '\n' + JSON.stringify(data, null, 2);
      } else {
        logContent += '\n' + String(data);
      }
    }
    
    logContent += '\n';
    
    fs.appendFileSync(logFile, logContent);
  } catch (error) {
    console.error('Błąd podczas zapisywania do pliku logu:', error);
  }
};

export const logError = (message: string, data?: any): void => log(LogLevel.ERROR, message, data);
export const logWarn = (message: string, data?: any): void => log(LogLevel.WARN, message, data);
export const logInfo = (message: string, data?: any): void => log(LogLevel.INFO, message, data);
export const logDebug = (message: string, data?: any): void => log(LogLevel.DEBUG, message, data);


export const logExecutionTime = async <T>(
  name: string, 
  func: () => Promise<T>
): Promise<T> => {
  const startTime = process.hrtime();
  
  try {
    const result = await func();
    
    const endTime = process.hrtime(startTime);
    const executionTimeMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    
    logInfo(`Wykonano ${name} w czasie ${executionTimeMs}ms`);
    
    return result;
  } catch (error) {
    const endTime = process.hrtime(startTime);
    const executionTimeMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    
    logError(`Błąd podczas wykonywania ${name} po ${executionTimeMs}ms`, error);
    throw error;
  }
}; 