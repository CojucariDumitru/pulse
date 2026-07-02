import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import {
  sendBookingConfirmation,
  sendWaitlistPromotion,
} from '../services/email.service';

function fmtWhen(d: Date, durationMin: number): string {
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(d);
  return `${date} · ${time} (${durationMin} min)`;
}

/** Active membership gate — booking is a member perk. */
async function assertActiveMembership(memberId: string) {
  const membership = await prisma.membership.findUnique({ where: { memberId } });
  const ok = membership && ['ACTIVE', 'TRIALING'].includes(membership.status);
  if (!ok) {
    throw new ApiError(402, 'An active membership is required to book classes', {
      code: 'MEMBERSHIP_REQUIRED',
    });
  }
}

/**
 * POST /api/bookings  { sessionId }
 * Books a spot if capacity allows, otherwise joins the waitlist —
 * decided atomically inside a transaction.
 */
export async function createBooking(req: Request, res: Response) {
  const memberId = req.user!.sub;
  const sessionId = String(req.body?.sessionId ?? '');
  if (!sessionId) throw ApiError.badRequest('sessionId is required');

  await assertActiveMembership(memberId);

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: true, instructor: true },
    });
    if (!session) throw ApiError.notFound('Class session not found');
    if (session.startsAt < new Date()) throw ApiError.badRequest('This class has already started');

    const existing = await tx.booking.findUnique({
      where: { memberId_sessionId: { memberId, sessionId } },
    });
    if (existing && existing.status !== 'CANCELLED') {
      throw ApiError.conflict(
        existing.status === 'WAITLIST' ? "You're already on the waitlist" : "You're already booked",
      );
    }

    const bookedCount = await tx.booking.count({
      where: { sessionId, status: 'BOOKED' },
    });
    const status = bookedCount < session.capacity ? 'BOOKED' : 'WAITLIST';

    const booking = existing
      ? await tx.booking.update({
          where: { id: existing.id },
          data: { status },
        })
      : await tx.booking.create({ data: { memberId, sessionId, status } });

    return { booking, session };
  });

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (member) {
    sendBookingConfirmation({
      name: member.name,
      email: member.email,
      className: result.session.classType.name,
      instructor: result.session.instructor.name,
      when: fmtWhen(result.session.startsAt, result.session.durationMin),
      room: result.session.room,
      waitlisted: result.booking.status === 'WAITLIST',
    }).catch(() => {});
  }

  res.status(201).json({
    booking: result.booking,
    waitlisted: result.booking.status === 'WAITLIST',
  });
}

/**
 * DELETE /api/bookings/:sessionId
 * Cancels the caller's booking and promotes the first waitlisted member.
 */
export async function cancelBooking(req: Request, res: Response) {
  const memberId = req.user!.sub;
  const { sessionId } = req.params;

  const promoted = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { memberId_sessionId: { memberId, sessionId } },
    });
    if (!booking || booking.status === 'CANCELLED') {
      throw ApiError.notFound('No active booking for this class');
    }

    const wasBooked = booking.status === 'BOOKED';
    await tx.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });

    if (!wasBooked) return null;

    // Promote the earliest waitlisted member into the freed spot.
    const next = await tx.booking.findFirst({
      where: { sessionId, status: 'WAITLIST' },
      orderBy: { createdAt: 'asc' },
      include: {
        member: { select: { name: true, email: true } },
        session: { include: { classType: true } },
      },
    });
    if (!next) return null;

    await tx.booking.update({ where: { id: next.id }, data: { status: 'BOOKED' } });
    return next;
  });

  if (promoted) {
    sendWaitlistPromotion({
      name: promoted.member.name,
      email: promoted.member.email,
      className: promoted.session.classType.name,
      when: fmtWhen(promoted.session.startsAt, promoted.session.durationMin),
    }).catch(() => {});
  }

  res.json({ cancelled: true, promotedFromWaitlist: Boolean(promoted) });
}

/** GET /api/bookings/mine — the member's upcoming + past bookings. */
export async function myBookings(req: Request, res: Response) {
  const memberId = req.user!.sub;
  const bookings = await prisma.booking.findMany({
    where: { memberId, status: { not: 'CANCELLED' } },
    orderBy: { session: { startsAt: 'asc' } },
    include: {
      session: {
        include: {
          classType: { select: { name: true, color: true, intensity: true } },
          instructor: { select: { name: true } },
        },
      },
    },
  });

  const now = new Date();
  res.json({
    upcoming: bookings.filter((b) => b.session.startsAt >= now),
    past: bookings.filter((b) => b.session.startsAt < now).reverse().slice(0, 20),
  });
}

/* ------------------------------ ADMIN ----------------------------- */

/** GET /api/admin/bookings?sessionId= */
export async function adminListBookings(req: Request, res: Response) {
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  const bookings = await prisma.booking.findMany({
    where: sessionId ? { sessionId } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      member: { select: { name: true, email: true } },
      session: { include: { classType: { select: { name: true } } } },
    },
  });
  res.json(bookings);
}
