"use client";

import {
  ArrowRight,
  BarChart3,
  Clock3,
  FileText,
  Link2,
  Menu,
  Plus,
  ReceiptText,
  Shield,
  TimerReset,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { SiGithub } from "react-icons/si";

const githubUrl = "https://github.com/PrimeFold/Invoicify";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-txt-primary">
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover:scale-105">
        <FileText className="size-4" aria-hidden="true" />
      </span>
      <span>Invoicify</span>
    </Link>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative lg:hidden">
      <button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="active-press grid size-9 place-items-center rounded-full border border-line bg-surface text-txt-primary">
        <Menu className="size-4" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 flex min-w-52 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 text-left shadow-xl">
          <Link onClick={close} href="/#why" className="rounded-xl px-3 py-2.5 text-sm text-txt-secondary hover:bg-surface-hover hover:text-txt-primary">Why I built it</Link>
          <Link onClick={close} href="/#features" className="rounded-xl px-3 py-2.5 text-sm text-txt-secondary hover:bg-surface-hover hover:text-txt-primary">Features</Link>
          <div className="my-1 border-t border-line" />
          <Link onClick={close} href="/login" className="rounded-xl px-3 py-2.5 text-sm text-txt-secondary hover:bg-surface-hover hover:text-txt-primary">Sign in</Link>
          <Link onClick={close} href="/register" className="rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground">Start tracking</Link>
        </div>
      ) : null}
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, transform: "translateY(24px)" },
  show: { opacity: 1, transform: "translateY(0)" },
};

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      variants={reveal}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function IslandButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-5 text-sm font-semibold transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] active:scale-[0.98] ${secondary ? "border border-line bg-surface/70 text-txt-primary hover:bg-surface-hover" : "bg-primary text-primary-foreground shadow-[0_14px_30px_-16px_var(--primary)] hover:-translate-y-0.5"}`}
    >
      {children}
      <span className={`grid size-7 place-items-center rounded-full transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover:translate-x-1 group-hover:-translate-y-px ${secondary ? "bg-canvas text-txt-secondary" : "bg-primary-foreground/15 text-primary-foreground"}`}>
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pb-32 sm:pt-20 lg:pb-40 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,oklch(0.65_0.22_285_/_0.15),transparent_30%),radial-gradient(circle_at_4%_70%,oklch(0.35_0.12_285_/_0.1),transparent_26%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="max-w-xl">
          <Reveal>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Built from a freelancer&apos;s frustration</p>
            <h1 className="max-w-[12ch] text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-txt-primary sm:text-6xl lg:text-7xl">Know what your work is worth.</h1>
            <p className="mt-7 max-w-[42ch] text-pretty text-base leading-7 text-txt-secondary sm:text-lg">Invoicify keeps your hours, clients, and invoices in one clear place, so the work behind your work stops getting lost.</p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row"><IslandButton href="/register">Start tracking</IslandButton><IslandButton href={githubUrl} secondary>View the source</IslandButton></div>
            <p className="mt-5 text-xs leading-5 text-txt-muted">Open source, self-hostable, and made for the way independent work actually happens.</p>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="relative lg:pl-6"><DashboardPreview /></Reveal>
      </div>
    </section>
  );
}

const previewStats = [["Tracked this week", "27.4 hrs", "Goal 32 hrs"], ["Unbilled work", "$2,184", "18.2 hrs · 3 clients"], ["Awaiting payment", "$4,760", "3 invoices open"], ["Paid this month", "$8,940", "7 paid invoices"]];
const previewClients = [["Northline Studio", "7.5 hrs · $120/hr", "$900"], ["Morrow & Finch", "5.2 hrs · $145/hr", "$754"], ["Cedar House", "3.8 hrs · $140/hr", "$532"]];
const previewLogs = [["Product strategy workshop", "Northline Studio · 2 hrs ago", "2h 15m"], ["Homepage implementation", "Morrow & Finch · 5 hrs ago", "3h 40m"], ["Analytics review", "Cedar House · yesterday", "1h 20m"]];
const previewInvoices = [["INV-2026-018 · Northline Studio", "Due in 3 days", "$2,340", "Sent"], ["INV-2026-017 · Morrow & Finch", "Paid 2 days ago", "$1,880", "Paid"], ["INV-2026-016 · Cedar House", "Paid 5 days ago", "$1,420", "Paid"]];

function DashboardPreview() {
  const reduced = useReducedMotion();

  return (
    <div className="group/preview relative rounded-[2rem] bg-surface/60 p-1.5 shadow-[0_28px_80px_-36px_oklch(0_0_0_/_0.7)] ring-1 ring-white/10 transition-transform duration-700 [transition-timing-function:var(--ease-apple-snappy)] hover:-translate-y-1">
      <div className="overflow-hidden rounded-[1.65rem] border border-line/70 bg-canvas shadow-[inset_0_1px_0_oklch(1_0_0_/_0.06)]">
        <div className="flex items-center justify-between border-b border-line/60 px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /><span className="text-[11px] font-semibold text-txt-primary">Dashboard</span></div><span className="hidden rounded-lg border border-line/70 bg-surface px-2 py-1 text-[9px] text-txt-muted sm:inline">invoicify.app/dashboard</span><span className="grid size-6 place-items-center rounded-lg border border-line/70 bg-surface text-txt-secondary"><Plus className="size-3" aria-hidden="true" /></span></div>
        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-base font-semibold tracking-tight text-txt-primary sm:text-lg">Good afternoon, Maya</p><p className="mt-1 text-[10px] text-txt-muted sm:text-xs">3 active clients · 3 invoices need sending</p></div><button className="hidden rounded-xl border border-line bg-surface px-3 py-2 text-[10px] font-semibold text-txt-primary transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:-translate-y-0.5 sm:inline-flex">New invoice</button></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">{previewStats.map(([label, value, note]) => <div key={label} className="rounded-xl border border-line/70 bg-surface p-3 transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:-translate-y-1 hover:bg-surface-hover"><p className="text-[9px] text-txt-secondary">{label}</p><p className="mt-1 text-sm font-semibold tracking-tight text-txt-primary sm:text-base">{value}</p><p className="mt-1 truncate text-[8px] text-txt-muted">{note}</p></div>)}</div>
          <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]"><section className="rounded-xl border border-line/70 bg-surface p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-txt-primary">Hours this week</h3><span className="text-[9px] text-txt-muted">27.4 hrs</span></div><div className="mt-5 flex h-28 items-end gap-2">{[46, 70, 56, 82, 64, 18, 10].map((height, index) => <div key={index} className="group/bar flex h-full flex-1 flex-col items-center justify-end gap-1.5"><motion.div initial={reduced ? false : { transform: "scaleY(0)" }} animate={{ transform: "scaleY(1)" }} transition={{ duration: 0.65, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }} className={`w-full origin-bottom rounded-t-md transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover/bar:scale-y-105 ${index === 3 ? "bg-primary" : "bg-primary/25"}`} style={{ height: `${height}%` }} /><span className="text-[8px] text-txt-muted">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>)}</div></section><section className="rounded-xl border border-line/70 bg-surface p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-txt-primary">Unbilled by client</h3><span className="text-[9px] text-txt-muted">18.2 hrs</span></div><div className="mt-2">{previewClients.map(([name, meta, amount]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><span className="text-[10px] font-semibold text-txt-primary">{amount}</span></div>)}</div></section></div>
          <div className="grid gap-3 lg:grid-cols-2"><PreviewList title="Recent time logs" rows={previewLogs} /><PreviewInvoices /></div>
        </div>
      </div>
    </div>
  );
}

function PreviewList({ title, rows }: { title: string; rows: string[][] }) { return <section className="rounded-xl border border-line/70 bg-surface p-4"><h3 className="text-xs font-semibold text-txt-primary">{title}</h3><div className="mt-2">{rows.map(([name, meta, value]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><span className="shrink-0 text-[9px] font-medium text-txt-secondary">{value}</span></div>)}</div></section>; }
function PreviewInvoices() { return <section className="rounded-xl border border-line/70 bg-surface p-4"><h3 className="text-xs font-semibold text-txt-primary">Invoices</h3><div className="mt-2">{previewInvoices.map(([name, meta, amount, status]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><div className="flex shrink-0 items-center gap-2"><span className="text-[9px] font-semibold text-txt-primary">{amount}</span><span className={`rounded-md px-1.5 py-0.5 text-[8px] font-medium ${status === "Paid" ? "bg-status-paid-bg text-status-paid" : "bg-primary/10 text-primary"}`}>{status}</span></div></div>)}</div></section>; }

function Origin() { return <section id="why" className="border-y border-line/60 px-6 py-24 sm:py-32"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-24"><Reveal className="lg:pt-12"><div className="max-w-[55ch]"><p className="text-lg leading-8 text-txt-secondary">I was tracking client work in spreadsheets, calculating totals by hand, and making invoices in Google Docs late at night. The gaps were small, but they added up.</p><p className="mt-6 text-base leading-7 text-txt-muted">Invoicify is the tool I wanted then: one quiet dashboard for the hours already worked, the money still waiting, and the invoice that should take one click.</p></div></Reveal><Reveal delay={0.08} className="lg:text-right"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Why I built it</p><h2 className="mt-5 ml-auto max-w-[12ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-txt-primary sm:text-5xl">The admin was stealing the good hours.</h2></Reveal></div></section>; }

function Workflow() { const items = [{ icon: TimerReset, title: "Capture the hours", body: "Start a timer or add a finished session. Every entry stays attached to the right client." }, { icon: FileText, title: "Turn work into invoices", body: "Select unbilled time and create a polished PDF without rebuilding the details." }, { icon: WalletCards, title: "See what is outstanding", body: "Know what is paid, what is open, and which work still needs a nudge." }]; return <section id="how-it-works" className="px-6 py-28 sm:py-36"><div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24"><Reveal><h2 className="max-w-[9ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-txt-primary sm:text-5xl">Less admin. More room to do the work.</h2><p className="mt-6 max-w-[34ch] text-sm leading-6 text-txt-secondary">Your workflow should show the business clearly, not create another one to manage.</p></Reveal><div className="grid gap-4 sm:grid-cols-3">{items.map(({ icon: Icon, title, body }, index) => <Reveal key={title} delay={index * 0.08}><article className="group relative min-h-56 rounded-2xl border border-line bg-surface p-5 transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:-translate-y-1 hover:bg-surface-hover"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span><span className="text-[10px] font-semibold text-txt-muted">{index === 0 ? "Capture" : index === 1 ? "Create" : "Review"}</span></div><h3 className="mt-12 text-base font-semibold text-txt-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-txt-secondary">{body}</p></article></Reveal>)}</div></div></section>; }

const features = [{ icon: Clock3, title: "Time that stays attached", body: "Log a session against a client, then carry those hours forward instead of copying them into another document." }, { icon: Link2, title: "A link clients can use", body: "Share invoices with 24-hour HMAC-signed links. No client account, no permanent public URL." }, { icon: BarChart3, title: "A real view of cash flow", body: "See collected revenue, billable hours, and unbilled accrual in the same place." }, { icon: Shield, title: "Built around ownership", body: "Email and password auth, isolated account data, and an architecture you can inspect and run yourself." }, { icon: Zap, title: "Fast where it matters", body: "Optimistic updates make status changes and deletions feel immediate while the server catches up." }];
function Features() { return <section id="features" className="px-6 pb-28 text-left sm:pb-40 md:text-right"><div className="mx-auto max-w-6xl"><Reveal><h2 className="md:ml-auto max-w-[10ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-txt-primary sm:text-5xl">Small decisions, made for independent work.</h2></Reveal><div className="mt-14 grid gap-4 md:grid-cols-12">{features.map(({ icon: Icon, title, body }, index) => <Reveal key={title} delay={index * 0.05} className={index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : index === 2 ? "md:col-span-5" : "md:col-span-7"}><article className={`h-full rounded-[1.5rem] p-6 text-left sm:p-8 ${index === 0 || index === 3 ? "bg-primary text-primary-foreground" : "border border-line bg-surface"}`}><Icon className={`size-5 ${index === 0 || index === 3 ? "text-primary-foreground/70" : "text-primary"}`} aria-hidden="true" /><h3 className="mt-12 max-w-[15ch] text-2xl font-semibold tracking-tight">{title}</h3><p className={`mt-4 max-w-[38ch] text-sm leading-6 ${index === 0 || index === 3 ? "text-primary-foreground/75" : "text-txt-secondary"}`}>{body}</p></article></Reveal>)}</div></div></section>; }

function Engineering() { return <section id="engineering" className="px-6 py-28 sm:py-36"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24"><Reveal><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">What I learned building it</p><h2 className="mt-5 max-w-[11ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-txt-primary sm:text-5xl">The boring parts are the product.</h2></Reveal><Reveal delay={0.08}><div className="space-y-7 text-sm leading-7 text-txt-secondary"><p>Invoices need to be deterministic. Share links need to expire. Redis needs one connection during hot reloads. The details are not decoration when money is involved.</p><p>That is why Invoicify uses server actions, Prisma, Redis, PDFKit, HMAC-signed URLs, and React&apos;s optimistic UI. Each choice started with a problem I actually had.</p><Link href={githubUrl} className="group inline-flex items-center gap-2 font-semibold text-txt-primary transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-primary">Read the implementation on GitHub <SiGithub className="size-4 transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover:translate-x-1" aria-hidden="true" /></Link></div></Reveal></div></section>; }

function Closing() { return <section className="px-6 pb-28 sm:pb-36"><Reveal><div className="mx-auto grid max-w-6xl items-end gap-10 rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-[0_24px_70px_-34px_var(--primary)] sm:p-12 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">Make the next hour count</p><h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">Start with the work you already did.</h2></div><IslandButton href="/register" secondary>Open your workspace</IslandButton></div></Reveal></section>; }

export function LandingPage() { return <main className="min-h-[100dvh] overflow-hidden bg-canvas text-txt-primary selection:bg-primary/20"><Hero /><Origin /><Workflow /><Features /><Engineering /><Closing /></main>; }

export { githubUrl };
