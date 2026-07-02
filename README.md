# ⚡ PULSE

> **Find your rhythm.**
> A boutique fitness studio platform: class booking with live capacity + waitlists,
> Stripe subscription memberships, and an AI-personalized 12-week program generator.

Full-stack TypeScript monorepo — React + Vite storefront, Express + Prisma API,
Postgres (Neon), Stripe Billing, Resend email, Cloudinary images, Gemini AI.

### 🔗 Live
- **Site:** https://pulse-studio-inky.vercel.app
- **API:** https://pulse-api.onrender.com/api/health
- **Admin:** https://pulse-studio-inky.vercel.app/admin — `admin@pulsestudio.app` / `Pulse2024!`
- **Demo member:** `demo@pulsestudio.app` / `Pulse2024!` (active Unlimited membership)

---

## ✨ Features

**Members**
- Browse the weekly schedule; book classes with **live spot counts**
- Full class → automatic **waitlist**, with auto-promotion (+ email) when a spot opens
- **Membership checkout**: Stripe subscription mode (or instant demo mode without keys)
- Stripe **billing portal** for self-service plan management
- Member dashboard: upcoming classes, history, membership status
- Emails via Resend: welcome, booking confirmation, waitlist promotion, membership active

**Program generator** (public, free)
- Intake: gender, age, height, weight, goal, experience, days/week, equipment
- Engine computes BMI, BMR (Mifflin-St Jeor), TDEE, goal-adjusted calories & macros
- Builds a periodized 12-week plan (3 mesocycles + deloads) with a split matched to
  training frequency (Full Body / Upper-Lower / PPL) and gym-vs-home exercise variants
- **Gemini AI** writes a personal coaching brief on top (graceful fallback without it)
- "Email me my plan" → full program delivered via Resend

**Admin** (`/admin`, JWT)
- Dashboard: members, active memberships, bookings, waitlists, unread messages
- Members table with plan/status; contact inbox with read/delete

---

## 🧱 Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind, Framer Motion, TanStack Query, RHF + Zod |
| Backend | Node, Express, TypeScript, Prisma, JWT, Helmet/CORS/rate-limit |
| Data | PostgreSQL (Neon) |
| Payments | Stripe subscriptions + webhooks + billing portal (demo mode without keys) |
| Email | Resend · AI: Google Gemini · Images: Cloudinary |
| Hosting | Vercel (client) · Render (API) |

---

## 💻 Run locally

```bash
# API
cd server
npm install
cp .env.example .env        # fill in DATABASE_URL etc.
npx prisma migrate dev
npm run seed
npm run dev                 # → http://localhost:5060

# Client (second terminal)
cd client
npm install
npm run dev                 # → http://localhost:5173
```

### Enable real Stripe checkout (optional)
1. Put `sk_test_...` into `server/.env` → `STRIPE_SECRET_KEY`
2. `npx tsx scripts/stripe-setup.ts` — creates products/prices, prints `STRIPE_PRICE_*`
3. Add a webhook endpoint for `/api/memberships/webhook` and set `STRIPE_WEBHOOK_SECRET`
4. Without keys the app runs a clearly-labeled **demo checkout** (instant activation)

---

## 🧭 API

**Public** — `GET /api/classes`, `GET /api/classes/schedule?days=7`,
`GET /api/memberships/plans`, `POST /api/program/generate`, `POST /api/program/email`,
`POST /api/contact`, `POST /api/auth/register|login`

**Member (JWT)** — `POST /api/bookings`, `DELETE /api/bookings/:sessionId`,
`GET /api/bookings/mine`, `POST /api/memberships/checkout|portal|cancel`, `GET /api/auth/me`

**Admin (JWT)** — `/api/admin/dashboard|members|bookings|messages`, session/class-type CRUD

**Stripe** — `POST /api/memberships/webhook` (raw body, signature-verified)

---

## 📧 Email demo mode

There is no verified sending domain, so emails go out via Resend's shared sender to the
project owner's inbox with the intended recipient in the subject (`[Demo → user@x.com] …`).
Flip `DEMO_MODE` in `server/src/services/email.service.ts` + verify a domain for real delivery.

---

Built as a portfolio project. © PULSE Studio NYC.
