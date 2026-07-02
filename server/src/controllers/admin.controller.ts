import { Request, Response } from 'express';
import { prisma } from '../config/database';

/** GET /api/admin/dashboard — headline stats. */
export async function dashboard(_req: Request, res: Response) {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
  const weekAhead = new Date(now);
  weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);

  const [
    totalMembers,
    activeMemberships,
    todaysSessions,
    weekBookings,
    waitlistCount,
    unreadMessages,
    upcomingSessions,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.membership.count({ where: { status: { in: ['ACTIVE', 'TRIALING'] } } }),
    prisma.classSession.count({ where: { startsAt: { gte: startOfDay, lt: endOfDay } } }),
    prisma.booking.count({
      where: { status: 'BOOKED', session: { startsAt: { gte: now, lt: weekAhead } } },
    }),
    prisma.booking.count({
      where: { status: 'WAITLIST', session: { startsAt: { gte: now } } },
    }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.classSession.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 6,
      include: {
        classType: { select: { name: true, color: true } },
        instructor: { select: { name: true } },
        bookings: { select: { status: true } },
      },
    }),
  ]);

  res.json({
    stats: {
      totalMembers,
      activeMemberships,
      todaysSessions,
      weekBookings,
      waitlistCount,
      unreadMessages,
    },
    upcoming: upcomingSessions.map((s) => ({
      id: s.id,
      startsAt: s.startsAt,
      capacity: s.capacity,
      className: s.classType.name,
      color: s.classType.color,
      instructor: s.instructor.name,
      booked: s.bookings.filter((b) => b.status === 'BOOKED').length,
      waitlist: s.bookings.filter((b) => b.status === 'WAITLIST').length,
    })),
  });
}

/** GET /api/admin/members */
export async function listMembers(_req: Request, res: Response) {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      membership: true,
      _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } },
    },
  });
  res.json(
    members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      createdAt: m.createdAt,
      bookings: m._count.bookings,
      membership: m.membership
        ? { plan: m.membership.plan, status: m.membership.status, currentPeriodEnd: m.membership.currentPeriodEnd }
        : null,
    })),
  );
}
