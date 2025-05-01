export * from './fileUtils';

export * from './csvUtils';

export * from './dataUtils';

import {
  logError as apiLogError,
  logResponse as apiLogResponse,
  logRequest as apiLogRequest,
  createHttpClient,
  parseResponseData,
  createSearchParams
} from './apiUtils';

export {
  apiLogError,
  apiLogResponse,
  apiLogRequest,
  createHttpClient,
  parseResponseData,
  createSearchParams
};

export * from './logUtils';

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

export const asyncHandler = <T>(
  fn: (...args: any[]) => Promise<T>
): ((...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Nieobsłużony błąd asynchroniczny:', error);
      throw error;
    }
  };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>, 
  retries: number = 3, 
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Próba ${attempt}/${retries} nieudana:`, lastError.message);
      
      if (attempt < retries) {
        await delay(delayMs * attempt);
      }
    }
  }
  
  throw lastError || new Error('Operacja nie powiodła się po wszystkich próbach');
}; 