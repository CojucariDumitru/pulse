import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function extract(req: Request): TokenPayload {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing authentication token');
  }
  try {
    return verifyToken(header.slice('Bearer '.length).trim());
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

/** Any logged-in user (member or admin). */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = extract(req);
  next();
}

/** Members only. */
export function requireMember(req: Request, _res: Response, next: NextFunction) {
  const user = extract(req);
  if (user.role !== 'member') throw ApiError.forbidden('Member account required');
  req.user = user;
  next();
}

/** Admins only. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = extract(req);
  if (user.role !== 'admin') throw ApiError.forbidden('Admin access required');
  req.user = user;
  next();
}
