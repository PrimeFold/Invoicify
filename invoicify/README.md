# ⚡ Invoicify

> **Turn active work hours into vector-perfect invoices.**  
> A modern, developer-first time log tracker and automated invoicing dashboard built with **Next.js (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **PDFKit**.

> 🚧 **Work in Progress:** This project is actively under development. Features, database models, and UI components are continuously being updated.

---

## **Lessons Learned (Developer Notes)**

I want to be transparent about a few mistakes I made while implementing PDF generation and caching — and what I learned fixing them.

- I initially created multiple Redis connections during development which caused flaky behaviour and resource usage. I fixed this by moving Redis into a safe singleton (`lib/redis.ts`) stored on `globalThis` so hot reloads reuse the same client.

- TypeScript was yelling that `user` was missing when I passed the DB result into the PDF renderer. That happened because my `Invoice` interface expected a `user` relation while my Prisma query only returned `client` and `items`. I learned to either request the exact relations from Prisma or accept the concrete Prisma payload type in the PDF builder — I chose the latter (`InvoiceWithClientAndItems`) to keep the PDF code focused on the fields it needs.

- I tried caching only after invoice creation, but repeated "Generate" clicks still hit the DB between requests. To fix this I added a deterministic generation cache key (based on `userId`, `clientId`, and sorted `timeLogIds`) so repeated generate requests return a cached result during a short TTL. This reduced duplicate writes and user-perceived latency.

- Caching binary PDFs: Redis doesn't store raw Buffers safely across clients, so I serialize PDFs to Base64 for storage and convert them back to `Buffer` when serving. I keep TTLs short (60–120s) and invalidate caches after updates.

- Remaining caveat: there's still a small race window between reading the generation key and creating the invoice. The robust solution is to either use a Redis lock (SET NX) around generation or atomically claim the generation slot. I left comments in the code where a lock would be appropriate.

Writing these down helped me spot fragility and make the code more resilient — hope it helps you too if you dig through the code.


## 🚨 Project Status

- [x] Tech stack configuration & project setup
- [x] Prisma database schema design (Clients, TimeLogs, Invoices)
- [ ] Active time tracking engine & client assignment UI
- [ ] Server Action pipeline for atomic invoice generation
- [ ] Server-side vector PDF streaming via Next.js Route Handlers
- [ ] Financial metrics dashboard & earnings analytics charts

---

## 🚀 Key Features (Planned & In Development)

* ⏱️ **Active Time Tracker:** Log billable hours per client with real-time UI synchronization.
* 📊 **Financial Dashboard:** Track unbilled revenue, pending invoices, and monthly earnings breakdown.
* 🧾 **Automated Invoice Engine:** Convert unbilled time logs into itemized invoices without manual calculations.
* 📄 **Vector PDF Streaming:** Server-side PDF generation using `PDFKit` via Route Handlers (no client-canvas rendering).
* 🔒 **Atomic Database Transactions:** Built-in Prisma `$transaction` pipelines ensuring logs are never double-billed.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, React Server Components, Server Actions)
* **Language:** TypeScript
* **Database & ORM:** PostgreSQL + Prisma ORM
* **Styling:** Tailwind CSS + Shadcn UI
* **PDF Generation:** `pdfkit`
* **Analytics & UI Icons:** Recharts, Lucide React

---

## 💻 Local Development Setup

### Prerequisites
* Node.js >= 18.x
* PostgreSQL instance running locally or via cloud provider (e.g., Supabase / Neon / Render)

### 1. Clone the repository
```bash
git clone [https://github.com/PrimeFold/invoicify.git](https://github.com/PrimeFold/invoicify.git)
cd invoicify

---

## **Troubleshooting & Known Issues**

- **Redis (connection & env):** The app expects `REDIS_URL` to be set. Example values:
	- From the host: `redis://localhost:6379`
	- From another Compose service: `redis://redis:6379`
	The project uses a safe singleton (`lib/redis.ts`) stored on `globalThis` to avoid opening multiple Redis connections during development (hot reloads).

- **TypeScript: PDF builder type mismatch:** You may see errors like "Property 'user' is missing" when passing a Prisma query result to the PDF renderer. This happens when the `Invoice` interface requires `user` but the query only returns `client` and `items`. Fixes:
	- Include `user` in the Prisma query: `include: { client: true, items: true, user: true }`, or
	- Use the exact Prisma payload type for the PDF builder (the repo uses `InvoiceWithClientAndItems` in `app/actions/pdfkit.ts`).

- **PDF caching (performance):** Generated PDFs are cached in Redis under the key `invoice-pdf:<invoiceId>` as Base64 strings with a short TTL (60s by default) to avoid re-generating on repeated requests. Helpers live in `lib/redis.ts` as `getPdfCache(invoiceId)` and `setPdfCache(invoiceId, buffer, ttl)`. Remember to invalidate the cache after invoice updates.

- **PDF content type:** PDFs generated with `pdfkit` are vector for text and drawings (scales cleanly). Embedded images are raster.

---