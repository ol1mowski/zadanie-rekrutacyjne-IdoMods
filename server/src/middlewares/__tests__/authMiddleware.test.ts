import { describe, it, expect, vi, beforeEach } from 'vitest';
import { basicAuth } from '../authMiddleware';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../config/config', () => ({
  config: {
    auth: {
      username: 'testuser',
      password: 'testpass'
    }
  }
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    nextFunction = vi.fn() as unknown as NextFunction;
  });

  it('should return 401 when Authorization header is missing', () => {
    mockRequest.headers = {};

    basicAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Brak uwierzytelnienia' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header format is invalid', () => {
    mockRequest.headers = { authorization: 'Bearer token' };

    basicAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nieprawidłowy format uwierzytelnienia' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when credentials are invalid', () => {
    mockRequest.headers = { authorization: 'Basic d3Jvbmd1c2VyOndyb25ncGFzcw==' };

    basicAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nieprawidłowe dane uwierzytelniające' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() when authentication is valid', () => {
    mockRequest.headers = { authorization: 'Basic dGVzdHVzZXI6dGVzdHBhc3M=' };

    basicAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
}); 