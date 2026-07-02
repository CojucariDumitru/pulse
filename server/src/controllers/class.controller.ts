import { Request, Response } from 'express';
import { z } from 'zod';
import { Intensity } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';

/** GET /api/classes — class types + instructors for the marketing pages. */
export async function listClassTypes(_req: Request, res: Response) {
  const [classTypes, instructors] = await Promise.all([
    prisma.classType.findMany({ orderBy: { order: 'asc' } }),
    prisma.instructor.findMany({ orderBy: { order: 'asc' } }),
  ]);
  res.json({ classTypes, instructors });
}

/**
 * GET /api/classes/schedule?from=YYYY-MM-DD&days=7
 * Sessions with live booked/waitlist counts and (if authed) the caller's booking.
 */
export async function schedule(req: Request, res: Response) {
  const fromStr = typeof req.query.from === 'string' ? req.query.from : '';
  const days = Math.min(Math.max(parseInt(String(req.query.days ?? '7'), 10) || 7, 1), 14);

  const from = fromStr ? new Date(`${fromStr}T00:00:00.000Z`) : new Date();
  if (isNaN(from.getTime())) throw ApiError.badRequest('Invalid from date');
  if (!fromStr) from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + days);

  const sessions = await prisma.classSession.findMany({
    where: { startsAt: { gte: from, lt: to } },
    orderBy: { startsAt: 'asc' },
    include: {
      classType: true,
      instructor: { select: { id: true, name: true, image: true } },
      bookings: { select: { memberId: true, status: true } },
    },
  });

  const memberId = req.user?.role === 'member' ? req.user.sub : null;

  res.json(
    sessions.map((s) => {
      const booked = s.bookings.filter((b) => b.status === 'BOOKED').length;
      const waitlist = s.bookings.filter((b) => b.status === 'WAITLIST').length;
      const mine = memberId ? s.bookings.find((b) => b.memberId === memberId) : null;
      return {
        id: s.id,
        startsAt: s.startsAt,
        durationMin: s.durationMin,
        capacity: s.capacity,
        room: s.room,
        classType: {
          id: s.classType.id,
          slug: s.classType.slug,
          name: s.classType.name,
          intensity: s.classType.intensity,
          color: s.classType.color,
          image: s.classType.image,
        },
        instructor: s.instructor,
        booked,
        waitlist,
        spotsLeft: Math.max(0, s.capacity - booked),
        myStatus: mine && mine.status !== 'CANCELLED' ? mine.status : null,
      };
    }),
  );
}

/* ------------------------------ ADMIN ----------------------------- */

const sessionSchema = z.object({
  classTypeId: z.string().min(1),
  instructorId: z.string().min(1),
  startsAt: z.coerce.date(),
  durationMin: z.coerce.number().int().min(15).max(180).optional(),
  capacity: z.coerce.number().int().min(1).max(100).optional(),
  room: z.string().max(60).nullable().optional(),
});

/** POST /api/admin/sessions */
export async function createSession(req: Request, res: Response) {
  const data = sessionSchema.parse(req.body);
  const session = await prisma.classSession.create({
    data: {
      classTypeId: data.classTypeId,
      instructorId: data.instructorId,
      startsAt: data.startsAt,
      durationMin: data.durationMin ?? 45,
      capacity: data.capacity ?? 16,
      room: data.room ?? null,
    },
    include: { classType: true, instructor: true },
  });
  res.status(201).json(session);
}

/** PATCH /api/admin/sessions/:id */
export async function updateSession(req: Request, res: Response) {
  const data = sessionSchema.partial().parse(req.body);
  const session = await prisma.classSession.update({
    where: { id: req.params.id },
    data,
    include: { classType: true, instructor: true },
  });
  res.json(session);
}

/** DELETE /api/admin/sessions/:id */
export async function deleteSession(req: Request, res: Response) {
  await prisma.classSession.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

const classTypeSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  description: z.string().min(1).max(600),
  intensity: z.nativeEnum(Intensity).optional(),
  durationMin: z.coerce.number().int().min(15).max(180).optional(),
  color: z.string().max(20).optional(),
  image: z.string().url().nullable().optional(),
  order: z.coerce.number().int().optional(),
});

/** POST /api/admin/class-types */
export async function createClassType(req: Request, res: Response) {
  const data = classTypeSchema.parse(req.body);
  const classType = await prisma.classType.create({ data });
  res.status(201).json(classType);
}

/** PATCH /api/admin/class-types/:id */
export async function updateClassType(req: Request, res: Response) {
  const data = classTypeSchema.partial().parse(req.body);
  const classType = await prisma.classType.update({ where: { id: req.params.id }, data });
  res.json(classType);
}
