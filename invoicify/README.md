# ⚡ Invoicify

> **Turn active work hours into vector-perfect invoices.**  
> A modern, developer-first time log tracker and automated invoicing dashboard built with **Next.js (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **PDFKit**.

> 🚧 **Work in Progress:** This project is actively under development. Features, database models, and UI components are continuously being updated.

---

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