import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import { sendWelcomeEmail } from '../services/email.service';

const registerSchema = z.object({
  name: z.string().min(2, 'Tell us your name').max(120),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function memberDto(m: {
  id: string;
  email: string;
  name: string;
  membership?: { plan: string; status: string; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean } | null;
}) {
  return {
    id: m.id,
    email: m.email,
    name: m.name,
    membership: m.membership
      ? {
          plan: m.membership.plan,
          status: m.membership.status,
          currentPeriodEnd: m.membership.currentPeriodEnd,
          cancelAtPeriodEnd: m.membership.cancelAtPeriodEnd,
        }
      : null,
  };
}

/** POST /api/auth/register */
export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with that email already exists');

  const member = await prisma.member.create({
    data: {
      email,
      name: data.name,
      phone: data.phone ?? null,
      password: await bcrypt.hash(data.password, 10),
    },
    include: { membership: true },
  });

  sendWelcomeEmail({ name: member.name, email: member.email }).catch(() => {});

  const token = signToken({ sub: member.id, email: member.email, role: 'member' });
  res.status(201).json({ token, member: memberDto(member) });
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const member = await prisma.member.findUnique({
    where: { email: email.toLowerCase() },
    include: { membership: true },
  });

  const hash = member?.password ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const ok = await bcrypt.compare(password, hash);
  if (!member || !ok) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ sub: member.id, email: member.email, role: 'member' });
  res.json({ token, member: memberDto(member) });
}

/** GET /api/auth/me */
export async function me(req: Request, res: Response) {
  const member = await prisma.member.findUnique({
    where: { id: req.user!.sub },
    include: { membership: true },
  });
  if (!member) throw ApiError.unauthorized('Account not found');
  res.json({ member: memberDto(member) });
}

/** POST /api/auth/admin/login */
export async function adminLogin(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  const hash = admin?.password ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const ok = await bcrypt.compare(password, hash);
  if (!admin || !ok) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ sub: admin.id, email: admin.email, role: 'admin' });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
}
