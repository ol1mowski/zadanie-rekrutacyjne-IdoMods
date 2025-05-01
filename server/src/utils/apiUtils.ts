import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const logRequest = (config: AxiosRequestConfig): void => {
  const { method, url, headers, data } = config;
  console.log(`[HTTP Request] ${method?.toUpperCase()} ${url}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Headers:', JSON.stringify(headers));
    
    const sensitiveHeaders = ['authorization', 'x-api-key', 'api-key'];
    const safeHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
    
    for (const header of sensitiveHeaders) {
      if (safeHeaders[header]) {
        safeHeaders[header] = '********';
      }
    }

    console.log('Request data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

export const logResponse = (response: AxiosResponse): void => {
  const { status, statusText, config, data } = response;
  console.log(`[HTTP Response] ${status} ${statusText} for ${config.method?.toUpperCase()} ${config.url}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Response data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

export const logError = (error: AxiosError): void => {
  if (error.response) {
    console.error(
      `[HTTP Error] ${error.response.status} ${error.response.statusText} for ${error.config?.method?.toUpperCase()} ${error.config?.url}`
    );
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    console.error('[HTTP Error] No response received:', error.message);
  } else {
    console.error('[HTTP Error] Request failed:', error.message);
  }
};

export const createHttpClient = (baseURL: string, headers: Record<string, string> = {}) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    timeout: 10000
  });
  
  client.interceptors.request.use(
    (config) => {
      logRequest(config);
      return config;
    },
    (error) => {
      console.error('[HTTP Request Error]', error);
      return Promise.reject(error);
    }
  );
  
  client.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error) => {
      logError(error);
      return Promise.reject(error);
    }
  );
  
  return client;
};

export const parseResponseData = <T>(data: any, path?: string): T | null => {
  if (!path) {
    return data as T;
  }
  
  const parts = path.split('.');
  let result = data;
  
  for (const part of parts) {
    if (!result || typeof result !== 'object') {
      return null;
    }
    result = result[part];
  }
  
  return result as T;
};

export const createSearchParams = (
  page: number = 0, 
  limit: number = 20, 
  filters: Record<string, any> = {}
): Record<string, any> => {
  return {
    params: { ...filters },
    resultsPage: page,
    resultsLimit: limit
  };
}; 