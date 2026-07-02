import { PrismaClient, Intensity, MembershipPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/** Cloudinary delivery URL (assets uploaded under pulse/ — see scripts/upload-cloudinary.mjs). */
const cld = (id: string, t = 'c_fill,g_auto,w_900,h_700') =>
  `https://res.cloudinary.com/dozr400tl/image/upload/${t},f_auto,q_auto/pulse/${id}`;

const CLASS_TYPES = [
  {
    slug: 'spin',
    name: 'Spin',
    description:
      'Rhythm cycling in the dark. Beat-synced sprints, climbs and drops on our custom volt-lit bikes — cardio that feels like a night out.',
    intensity: Intensity.HIGH,
    durationMin: 45,
    color: '#CCFF00',
    image: cld('class-spin'),
    order: 0,
  },
  {
    slug: 'hiit',
    name: 'HIIT',
    description:
      'Intervals with intent. Sleds, ropes, bikes and bodyweight in timed rounds — maximum output, zero filler, done in 45.',
    intensity: Intensity.HIGH,
    durationMin: 45,
    color: '#FF5C2B',
    image: cld('class-hiit'),
    order: 1,
  },
  {
    slug: 'strength',
    name: 'Strength',
    description:
      'Coached barbell and dumbbell work in small groups. Squat, press, pull — progressive loading with a coach on your form every rep.',
    intensity: Intensity.MEDIUM,
    durationMin: 60,
    color: '#7DD3FC',
    image: cld('class-strength'),
    order: 2,
  },
  {
    slug: 'yoga-flow',
    name: 'Yoga Flow',
    description:
      'Dynamic vinyasa to close the loop. Mobility, breath and control — the recovery your training week actually needs.',
    intensity: Intensity.ALL_LEVELS,
    durationMin: 60,
    color: '#C4B5FD',
    image: cld('class-yoga'),
    order: 3,
  },
];

const INSTRUCTORS = [
  {
    name: 'Maya Chen',
    bio: 'Former track sprinter turned rhythm-cycling obsessive. Her playlists hit harder than her intervals — barely.',
    image: cld('coach-maya', 'c_fill,g_face,w_500,h_650'),
    specialties: ['Spin', 'HIIT'],
    order: 0,
  },
  {
    name: 'Andre Silva',
    bio: 'CSCS strength coach with a decade under the bar. If your squat is stuck, Andre is the unstick.',
    image: cld('coach-andre', 'c_fill,g_face,w_500,h_650'),
    specialties: ['Strength', 'HIIT'],
    order: 1,
  },
  {
    name: 'Ivy Okonkwo',
    bio: '500-hour RYT and mobility nerd. Makes hard things feel possible and possible things feel easy.',
    image: cld('coach-ivy', 'c_fill,g_face,w_500,h_650'),
    specialties: ['Yoga Flow', 'Mobility'],
    order: 2,
  },
];

/** Weekly timetable template: [dayType, hourUTC, minute, classSlug, coachIdx, capacity, room] */
const WEEKDAY_SLOTS: [number, number, string, number, number, string][] = [
  [7, 0, 'spin', 0, 16, 'The Dark Room'],
  [12, 30, 'hiit', 1, 14, 'The Floor'],
  [17, 30, 'strength', 1, 12, 'The Rack'],
  [19, 0, 'yoga-flow', 2, 18, 'The Loft'],
];
const WEEKEND_SLOTS: [number, number, string, number, number, string][] = [
  [9, 0, 'spin', 0, 20, 'The Dark Room'],
  [10, 30, 'hiit', 1, 16, 'The Floor'],
  [12, 0, 'yoga-flow', 2, 18, 'The Loft'],
];

async function main() {
  console.log('⚡ Seeding PULSE...');

  // ---- Admin ----
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@pulsestudio.app').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Pulse2024!';
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: await bcrypt.hash(adminPassword, 10) },
    create: { email: adminEmail, password: await bcrypt.hash(adminPassword, 10) },
  });
  console.log(`   ✓ Admin: ${adminEmail}`);

  // ---- Wipe schedule-related data (idempotent reseed) ----
  await prisma.booking.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.classType.deleteMany();
  await prisma.instructor.deleteMany();

  const classTypes = await Promise.all(
    CLASS_TYPES.map((c) => prisma.classType.create({ data: c })),
  );
  const bySlug = Object.fromEntries(classTypes.map((c) => [c.slug, c]));
  console.log(`   ✓ Class types: ${classTypes.length}`);

  const instructors = await Promise.all(
    INSTRUCTORS.map((i) => prisma.instructor.create({ data: i })),
  );
  console.log(`   ✓ Instructors: ${instructors.length}`);

  // ---- Sessions: next 14 days ----
  const sessions: { classTypeId: string; instructorId: string; startsAt: Date; durationMin: number; capacity: number; room: string }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let d = 0; d < 14; d++) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() + d);
    const dow = day.getUTCDay(); // 0 Sun ... 6 Sat
    const slots = dow === 0 || dow === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS;

    for (const [hour, minute, slug, coachIdx, capacity, room] of slots) {
      const startsAt = new Date(day);
      startsAt.setUTCHours(hour, minute, 0, 0);
      if (startsAt < new Date()) continue; // skip past sessions today
      const ct = bySlug[slug];
      sessions.push({
        classTypeId: ct.id,
        instructorId: instructors[coachIdx].id,
        startsAt,
        durationMin: ct.durationMin,
        capacity,
        room,
      });
    }
  }
  await prisma.classSession.createMany({ data: sessions });
  console.log(`   ✓ Sessions (next 14 days): ${sessions.length}`);

  // ---- Demo member with active membership + bookings ----
  const demoEmail = 'demo@pulsestudio.app';
  const demo = await prisma.member.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: 'Demo Member',
      password: await bcrypt.hash('Pulse2024!', 10),
      phone: '+1 (212) 555-0188',
    },
  });
  const periodEnd = new Date();
  periodEnd.setUTCDate(periodEnd.getUTCDate() + 30);
  await prisma.membership.upsert({
    where: { memberId: demo.id },
    update: { plan: MembershipPlan.UNLIMITED, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    create: {
      memberId: demo.id,
      plan: MembershipPlan.UNLIMITED,
      status: 'ACTIVE',
      currentPeriodEnd: periodEnd,
    },
  });

  // Book the demo member into the next two sessions.
  const nextSessions = await prisma.classSession.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: 'asc' },
    take: 2,
  });
  for (const s of nextSessions) {
    await prisma.booking.create({
      data: { memberId: demo.id, sessionId: s.id, status: 'BOOKED' },
    });
  }
  console.log(`   ✓ Demo member: ${demoEmail} / Pulse2024! (UNLIMITED, ${nextSessions.length} bookings)`);

  // ---- A couple of "crowd" members so classes don't look empty ----
  const crowdNames = [
    ['Jordan Lee', 'jordan.lee@example.com'],
    ['Sam Ortiz', 'sam.ortiz@example.com'],
    ['Nina Petrova', 'nina.petrova@example.com'],
    ['Chris Novak', 'chris.novak@example.com'],
    ['Aisha Bello', 'aisha.bello@example.com'],
  ];
  const crowd = [];
  for (const [name, email] of crowdNames) {
    const m = await prisma.member.upsert({
      where: { email },
      update: {},
      create: { email, name, password: await bcrypt.hash('Password123!', 10) },
    });
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 30);
    await prisma.membership.upsert({
      where: { memberId: m.id },
      update: { plan: MembershipPlan.ESSENTIAL, status: 'ACTIVE', currentPeriodEnd: end },
      create: { memberId: m.id, plan: MembershipPlan.ESSENTIAL, status: 'ACTIVE', currentPeriodEnd: end },
    });
    crowd.push(m);
  }

  // Sprinkle crowd bookings across the first 6 upcoming sessions.
  const fillSessions = await prisma.classSession.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: 'asc' },
    take: 6,
  });
  let bookingCount = 0;
  for (let i = 0; i < fillSessions.length; i++) {
    const take = (i % 3) + 2; // 2-4 bookings per session
    for (const m of crowd.slice(0, take)) {
      await prisma.booking.upsert({
        where: { memberId_sessionId: { memberId: m.id, sessionId: fillSessions[i].id } },
        update: {},
        create: { memberId: m.id, sessionId: fillSessions[i].id, status: 'BOOKED' },
      });
      bookingCount++;
    }
  }
  console.log(`   ✓ Crowd: ${crowd.length} members, ${bookingCount} bookings`);

  // ---- Contact messages ----
  await prisma.contactMessage.deleteMany();
  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Rachel Kim',
        email: 'rachel.kim@example.com',
        subject: 'Corporate wellness partnership',
        message:
          "Hi! I manage people ops at a 40-person startup two blocks away. Do you offer corporate memberships or private group sessions? We'd love a weekly team slot.",
        read: false,
      },
      {
        name: 'Tomas Berg',
        email: 'tomas.berg@example.com',
        subject: 'Drop-in for visitors?',
        message:
          "Visiting NYC for two weeks in August — can I drop into Spin classes without a monthly plan? What's the single-class rate?",
        read: false,
      },
    ],
  });
  console.log('   ✓ Contact messages: 2');

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
