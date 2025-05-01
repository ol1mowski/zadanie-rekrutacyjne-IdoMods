import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ error: 'Brak uwierzytelnienia' });
  }
  
  const authParts = authHeader.split(' ');
  
  if (authParts.length !== 2 || authParts[0] !== 'Basic') {
    return res.status(401).json({ error: 'Nieprawidłowy format uwierzytelnienia' });
  }
  
  const authData = Buffer.from(authParts[1], 'base64').toString();
  const [username, password] = authData.split(':');
  
  if (username !== config.auth.username || password !== config.auth.password) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ error: 'Nieprawidłowe dane uwierzytelniające' });
  }
  
  next();
}; 