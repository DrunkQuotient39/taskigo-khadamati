import { type Request, type Response, type NextFunction } from 'express';
import { log } from './log';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).requestId as string | undefined;
  const safe = (v: any) => {
    try {
      const json = JSON.stringify(v);
      return json.length > 2000 ? json.slice(0, 2000) + '…' : json;
    } catch {
      return String(v);
    }
  };
  log('warn', 'route_not_found', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    headers: safe(req.headers),
    query: safe(req.query),
    body: safe(req.body),
  });
  const isDev = process.env.NODE_ENV === 'development';
  res.status(404).json({ 
    error: 'Not found',
    ...(isDev && { method: req.method, path: req.originalUrl, requestId })
  });
}

export function globalErrorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  const isDev = process.env.NODE_ENV === 'development';
  const requestId = (req as any).requestId as string | undefined;

  log('error', 'server_error', {
    requestId,
    name: err?.name || 'Error',
    message,
    status,
  });

  res.status(status).json({
    message,
    ...(isDev && { stack: err?.stack, requestId }),
  });
}


