import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireMember, requireAdmin } from '../middleware/auth';
import { authLimiter, formLimiter } from '../middleware/rateLimiter';
import { verifyToken } from '../utils/jwt';

import { register, login, me, adminLogin } from '../controllers/auth.controller';
import {
  listClassTypes,
  schedule,
  createSession,
  updateSession,
  deleteSession,
  createClassType,
  updateClassType,
} from '../controllers/class.controller';
import {
  createBooking,
  cancelBooking,
  myBookings,
  adminListBookings,
} from '../controllers/booking.controller';
import {
  listPlans,
  checkout,
  portal,
  demoCancel,
} from '../controllers/membership.controller';
import { generate, emailProgram } from '../controllers/program.controller';
import {
  createContactMessage,
  adminListMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/contact.controller';
import { dashboard, listMembers } from '../controllers/admin.controller';

const router = Router();

/** Attaches req.user when a valid token is present, but never blocks. */
function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice(7).trim());
    } catch {
      /* anonymous */
    }
  }
  next();
}

/* ---- auth ---- */
router.post('/auth/register', authLimiter, asyncHandler(register));
router.post('/auth/login', authLimiter, asyncHandler(login));
router.get('/auth/me', requireMember, asyncHandler(me));
router.post('/auth/admin/login', authLimiter, asyncHandler(adminLogin));

/* ---- classes & schedule (public; schedule enriches when authed) ---- */
router.get('/classes', asyncHandler(listClassTypes));
router.get('/classes/schedule', optionalAuth, asyncHandler(schedule));

/* ---- bookings (member) ---- */
router.post('/bookings', requireMember, asyncHandler(createBooking));
router.delete('/bookings/:sessionId', requireMember, asyncHandler(cancelBooking));
router.get('/bookings/mine', requireMember, asyncHandler(myBookings));

/* ---- memberships ---- */
router.get('/memberships/plans', asyncHandler(listPlans));
router.post('/memberships/checkout', requireMember, asyncHandler(checkout));
router.post('/memberships/portal', requireMember, asyncHandler(portal));
router.post('/memberships/cancel', requireMember, asyncHandler(demoCancel));
// NOTE: /memberships/webhook is mounted in index.ts with a raw body parser.

/* ---- program generator (public) ---- */
router.post('/program/generate', formLimiter, asyncHandler(generate));
router.post('/program/email', formLimiter, asyncHandler(emailProgram));

/* ---- contact ---- */
router.post('/contact', formLimiter, asyncHandler(createContactMessage));

/* ---- admin ---- */
router.get('/admin/dashboard', requireAdmin, asyncHandler(dashboard));
router.get('/admin/members', requireAdmin, asyncHandler(listMembers));
router.get('/admin/bookings', requireAdmin, asyncHandler(adminListBookings));
router.post('/admin/sessions', requireAdmin, asyncHandler(createSession));
router.patch('/admin/sessions/:id', requireAdmin, asyncHandler(updateSession));
router.delete('/admin/sessions/:id', requireAdmin, asyncHandler(deleteSession));
router.post('/admin/class-types', requireAdmin, asyncHandler(createClassType));
router.patch('/admin/class-types/:id', requireAdmin, asyncHandler(updateClassType));
router.get('/admin/messages', requireAdmin, asyncHandler(adminListMessages));
router.patch('/admin/messages/:id/read', requireAdmin, asyncHandler(markMessageRead));
router.delete('/admin/messages/:id', requireAdmin, asyncHandler(deleteMessage));

export default router;
