import { apiClient } from './client';
import type {
  ClassType,
  Instructor,
  ScheduleSession,
  Plan,
  Member,
  MyBooking,
  ProgramIntake,
  GeneratedProgram,
  CoachNotes,
  MembershipPlanId,
} from '../lib/types';

/* ---------- auth ---------- */

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ token: string; member: Member }> {
  const { data } = await apiClient.post('/auth/register', input);
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; member: Member }> {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function fetchMe(): Promise<Member> {
  const { data } = await apiClient.get('/auth/me');
  return data.member;
}

export async function adminLogin(email: string, password: string): Promise<{ token: string }> {
  const { data } = await apiClient.post('/auth/admin/login', { email, password });
  return data;
}

/* ---------- classes & schedule ---------- */

export async function fetchClasses(): Promise<{ classTypes: ClassType[]; instructors: Instructor[] }> {
  const { data } = await apiClient.get('/classes');
  return data;
}

export async function fetchSchedule(params?: { from?: string; days?: number }): Promise<ScheduleSession[]> {
  const { data } = await apiClient.get('/classes/schedule', { params });
  return data;
}

/* ---------- bookings ---------- */

export async function bookSession(sessionId: string): Promise<{ waitlisted: boolean }> {
  const { data } = await apiClient.post('/bookings', { sessionId });
  return data;
}

export async function cancelBooking(sessionId: string): Promise<{ cancelled: boolean }> {
  const { data } = await apiClient.delete(`/bookings/${sessionId}`);
  return data;
}

export async function fetchMyBookings(): Promise<{ upcoming: MyBooking[]; past: MyBooking[] }> {
  const { data } = await apiClient.get('/bookings/mine');
  return data;
}

/* ---------- memberships ---------- */

export async function fetchPlans(): Promise<{ plans: Plan[]; stripeConfigured: boolean }> {
  const { data } = await apiClient.get('/memberships/plans');
  return data;
}

export async function checkoutPlan(
  plan: MembershipPlanId,
): Promise<{ demo: boolean; activated?: boolean; url?: string }> {
  const { data } = await apiClient.post('/memberships/checkout', { plan });
  return data;
}

export async function openPortal(): Promise<{ url: string }> {
  const { data } = await apiClient.post('/memberships/portal');
  return data;
}

export async function demoCancelMembership(): Promise<{ cancelled: boolean }> {
  const { data } = await apiClient.post('/memberships/cancel');
  return data;
}

/* ---------- program ---------- */

export async function generateProgram(
  intake: ProgramIntake,
): Promise<{ program: GeneratedProgram; coachNotes: CoachNotes | null }> {
  const { data } = await apiClient.post('/program/generate', intake);
  return data;
}

export async function emailProgram(email: string, intake: ProgramIntake): Promise<{ emailSent: boolean }> {
  const { data } = await apiClient.post('/program/email', { email, intake });
  return data;
}

/* ---------- contact ---------- */

export async function sendContact(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ emailSent: boolean }> {
  const { data } = await apiClient.post('/contact', input);
  return data;
}

/* ---------- admin ---------- */

export interface AdminDashboard {
  stats: {
    totalMembers: number;
    activeMemberships: number;
    todaysSessions: number;
    weekBookings: number;
    waitlistCount: number;
    unreadMessages: number;
  };
  upcoming: {
    id: string;
    startsAt: string;
    capacity: number;
    className: string;
    color: string;
    instructor: string;
    booked: number;
    waitlist: number;
  }[];
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get('/admin/dashboard');
  return data;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  bookings: number;
  membership: { plan: string; status: string; currentPeriodEnd: string | null } | null;
}

export async function fetchAdminMembers(): Promise<AdminMember[]> {
  const { data } = await apiClient.get('/admin/members');
  return data;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function fetchAdminMessages(): Promise<AdminMessage[]> {
  const { data } = await apiClient.get('/admin/messages');
  return data;
}

export async function markMessageRead(id: string, read: boolean): Promise<void> {
  await apiClient.patch(`/admin/messages/${id}/read`, { read });
}

export async function deleteMessage(id: string): Promise<void> {
  await apiClient.delete(`/admin/messages/${id}`);
}
