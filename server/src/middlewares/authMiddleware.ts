import { Request, Response, NextFunction } from 'express';
import basicAuth from 'basic-auth';
import { config } from '../config/config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const user = basicAuth(req);
  
  if (!user || user.name !== config.auth.username || user.pass !== config.auth.password) {
    res.set('WWW-Authenticate', 'Basic realm="API Authentication"');
    res.status(401).send('Nieautoryzowany dostęp');
    return;
  }
  
  next();
}; 