# ⚡ Invoicify

### Freelance Time Tracking & Automated Invoicing Platform

> I built Invoicify because I was tired of losing money.
>
> As a freelancer juggling multiple clients, I was tracking hours in spreadsheets, manually calculating totals, and generating invoices in Google Docs at 2 AM. I missed billable hours. I forgot to follow up on unpaid invoices. I had no visibility into how much revenue I'd actually collected versus how much was sitting unbilled.
>
> So I built the tool I wished existed — a single dashboard where I log time, generate pixel-perfect PDF invoices with one click, and share them via secure expiring links. No spreadsheets. No guesswork. Just clarity.

---

## The Problem I Solved

| Pain Point | What Invoicify Does |
|---|---|
| Hours tracked in spreadsheets, easy to forget or miscount | **Live time tracker** with per-client session logging and automatic duration calculation |
| Manual invoice creation in docs/templates | **One-click PDF invoice generation** from selected unbilled time logs using PDFKit |
| No way to share invoices securely with clients | **24-hour HMAC-signed shareable links** with tamper-proof token verification |
| Zero visibility into cash flow | **Real-time financial dashboard** with 12-month revenue trajectory charts and unbilled accrual metrics |
| No record of what's been paid vs. what's outstanding | **Invoice lifecycle management** — track UNPAID → PAID status with optimistic UI updates |

---

## Architecture & Technical Decisions

This isn't a tutorial project. Every architectural decision was driven by a real problem I encountered during my freelancing workflow.

### Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15+ App Router                 │
│              React Server Components + Server Actions        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Dashboard   │   Clients    │  Time Logs   │   Invoices     │
│  (analytics) │   (CRUD)     │  (tracker)   │   (PDF gen)    │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                     Server Actions Layer                     │
│         dashboard.ts · client.ts · timelog.ts · invoices.ts  │
├─────────────────────┬───────────────────────────────────────┤
│   Prisma ORM        │         Redis (ioredis)               │
│   PostgreSQL        │   Query cache · PDF binary cache      │
│   Schema-first      │   Singleton connection management     │
├─────────────────────┴───────────────────────────────────────┤
│                    Better Auth (Sessions)                    │
│              Email/password · Session tokens                 │
└─────────────────────────────────────────────────────────────┘
```

### Why These Technologies

- **Next.js App Router with Server Actions** — No separate API layer. Server Actions colocate data mutations with the UI components that trigger them, eliminating boilerplate REST endpoints while maintaining type safety from database to render.

- **Prisma ORM over raw SQL** — Schema-first modeling with generated TypeScript types means my `Invoice`, `Client`, `TimeLog`, and `InvoiceItem` relations are type-checked at compile time. When I query an invoice with its client and line items, the return type is exact — no `any`, no runtime surprises.

- **Redis caching layer** — Unbilled time log queries and PDF binary buffers are cached with short TTLs (60–120s). I serialize PDFs to Base64 for Redis storage and deserialize on read. A singleton connection pattern (`globalThis`) prevents connection leaks during Next.js hot reloads.

- **PDFKit for server-side PDF generation** — Vector-based PDF rendering with programmatic control over typography, layout grids, table positioning, and color. No browser dependency, no headless Chrome, no Puppeteer overhead.

- **HMAC-SHA256 signed URLs** — Invoice share links are cryptographically signed with a 24-hour expiration window. The token encodes `invoiceId + expiresAt` and is verified server-side before rendering. No database lookup required for token validation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15+ (App Router, RSC, Server Actions, Turbopack) |
| **Language** | TypeScript (strict mode, end-to-end type safety) |
| **Runtime** | React 19 (`useOptimistic`, `useTransition`, Suspense) |
| **Database** | PostgreSQL + Prisma ORM (schema-first, generated types) |
| **Caching** | Redis via `ioredis` (query cache, binary PDF cache) |
| **Auth** | Better Auth (session-based, email/password) |
| **PDF Engine** | PDFKit (server-side vector PDF generation) |
| **Styling** | Tailwind CSS v4 + OKLCH color system |
| **Charts** | Recharts (ComposedChart — bar + line overlays) |
| **Validation** | Zod (runtime schema validation for forms and server actions) |
| **State** | Zustand (client-side state), React 19 optimistic updates |
| **Testing** | Vitest + Testing Library (unit + integration) |
| **UI Components** | Base UI + shadcn/ui primitives |
| **Icons** | Lucide React |

---

## Key Features

### 🕐 Time Tracking
- Per-client session-based time logger with start/stop controls
- Automatic duration calculation (minutes → human-readable format)
- Bulk selection of unbilled time logs for invoice generation
- Status lifecycle: `UNBILLED` → `INVOICED` (automatically updated on invoice creation)

### 📄 One-Click Invoice Generation
- Select a client → pick unbilled time logs → generate a professionally formatted PDF invoice
- Automatic invoice numbering (`INV-2026-001`, `INV-2026-002`, ...)
- Line-item breakdown with hours, hourly rate, and line totals
- PDFs rendered server-side with PDFKit — no browser dependency

### 🔗 Secure Shareable Links
- 24-hour HMAC-SHA256 signed URLs for client invoice sharing
- Tamper-proof token verification (no database query needed)
- Public preview page with embedded PDF viewer, download, and print controls
- Expiration badge with countdown indicator

### 📊 Financial Dashboard
- 12-month revenue trajectory (collected revenue bars + billable hours trend line)
- Real-time unbilled accrual tracking across all clients
- Per-client breakdown: hourly rate, unbilled hours, unbilled amount
- All metrics derived from live database queries — zero mock data

### ✅ Invoice Lifecycle Management
- Mark invoices as PAID with confirmation dialog and optimistic UI updates
- Status badges: `UNPAID` (pending amber) / `PAID` (success green)
- Instant 0ms UI feedback using React 19's `useOptimistic` hook

---

## Engineering Highlights

These are the problems I'm most proud of solving:

### Optimistic UI with Zero-Latency Feedback
Deleting a time log or marking an invoice as paid updates the UI in **0 milliseconds** using React 19's `useOptimistic` hook. The server action executes asynchronously in the background while the user sees the change instantly. If the server action fails, the UI automatically reverts.

### Redis Singleton Connection Management
Next.js hot module replacement creates new module instances on every file save during development. Without careful handling, each reload spawns a new Redis connection. I solved this by storing the Redis client on `globalThis` — a single connection persists across hot reloads, preventing resource exhaustion and connection pool limits.

### Deterministic Invoice Generation Caching
Repeated "Generate Invoice" clicks (double-clicks, impatient users) don't create duplicate invoices. I compute a deterministic cache key from `userId + clientId + sorted(timeLogIds)` and check Redis before writing to the database. The cached result is returned during a short TTL window.

### PDF Binary Caching in Redis
Redis doesn't natively store `Buffer` objects safely. I serialize generated PDFs to Base64 strings for storage and deserialize them back to `Buffer` when serving. TTLs are kept short (60–120s) to balance memory usage with cache hit rates.

### Cryptographic Link Sharing Without Database Overhead
Instead of storing share tokens in the database, I generate HMAC-SHA256 signatures over `invoiceId:expiresAt` using a server-side secret. Verification is a pure computation — no database round-trip required. Links auto-expire after 24 hours with no cleanup job needed.

---

## Data Model

```
User ──┬── Client ──┬── TimeLog
       │            └── Invoice ── InvoiceItem
       ├── TimeLog
       └── Invoice
```

- **User** → owns clients, time logs, and invoices (cascade delete)
- **Client** → has an hourly rate, linked to time logs and invoices
- **TimeLog** → tracks `startTime`, `endTime`, `durationMinutes`, and billing status
- **Invoice** → auto-numbered, tracks `totalAmount` and payment status
- **InvoiceItem** → line-item breakdown (description, hours, rate, lineTotal)

---

## Testing

```bash
npx vitest run
```

```
✓ __tests__/signed-urls.test.ts (4 tests)
  ✓ generates a valid HMAC-SHA256 signed token
  ✓ verifies a legitimate token successfully
  ✓ rejects a tampered token signature
  ✓ rejects an expired token

✓ __tests__/pdfkit.test.ts (1 test)
  ✓ generates a valid PDF binary buffer

Test Files  2 passed (2)
     Tests  5 passed (5)
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL (PostgreSQL) and REDIS_URL

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Start the development server (Turbopack)
npm run dev
```

---

## Project Structure

```
invoicify/
├── app/
│   ├── (auth)/              # Login / Register pages
│   ├── (dashboard)/         # Dashboard, Clients, Time Logs, Invoices
│   ├── (marketing)/         # Landing page
│   ├── actions/             # Server Actions (client, timelog, invoice, dashboard, pdfkit)
│   ├── api/                 # API routes (PDF streaming, auth)
│   ├── preview/             # Public invoice preview page
│   └── validations/         # Zod schemas
├── components/
│   ├── dashboard/           # Sidebar, layout components
│   ├── clients/             # Client CRUD dialogs and table
│   ├── timelogs/            # Time tracker, metrics, table
│   ├── invoices/            # Invoice creation flow, table, dialogs
│   └── ui/                  # Base UI primitives (Button, Card, Dialog, AlertDialog)
├── lib/
│   ├── auth.ts              # Better Auth client configuration
│   ├── redis.ts             # Redis singleton connection
│   ├── signed-urls.ts       # HMAC-SHA256 token generation & verification
│   └── generated/prisma/    # Prisma generated client
├── prisma/
│   └── schema.prisma        # Database schema
├── __tests__/               # Vitest test suites
└── vitest.config.ts         # Test configuration
```

---

## Lessons Learned

Building Invoicify taught me things no tutorial could:

- **Redis isn't plug-and-play in serverless-adjacent environments.** Connection management, binary serialization, and cache invalidation timing all required deliberate engineering decisions rather than "just add Redis."

- **Optimistic UI is a UX superpower.** The difference between a 500ms delay and instant feedback is the difference between "this feels broken" and "this feels native." React 19's `useOptimistic` made this trivial to implement correctly.

- **PDF generation belongs on the server.** Headless browser approaches (Puppeteer, Playwright) are heavyweight and fragile. PDFKit gives me vector-perfect output with full programmatic control and zero browser dependencies.

- **Signed URLs > stored tokens for ephemeral access.** Computing an HMAC signature is cheaper than a database write + cleanup job. For short-lived share links, cryptographic verification is the right architectural choice.

- **Type safety isn't optional — it's velocity.** End-to-end TypeScript (Prisma generated types → Server Actions → React components) eliminated entire categories of runtime bugs. When the types compile, the data flows correctly.

---

<p align="center">
  <sub>Built with conviction by a freelancer who needed better tools — and decided to engineer them.</sub>
</p>
