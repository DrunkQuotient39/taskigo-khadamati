import { type Request, type Response, type NextFunction } from 'express';
import { nanoid } from 'nanoid';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = (req.headers['x-request-id'] as string) || '';
  const id = incoming && incoming.trim().length > 0 ? incoming : nanoid(12);
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}


