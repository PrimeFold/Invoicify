"use client";

import {
  ArrowRight,
  Clock3,
  FileText,
  Plus,
  ReceiptText,
  TimerReset,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-txt-primary">
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover:scale-105">
        <ReceiptText className="size-4" aria-hidden="true" />
      </span>
      <span>Invoicify</span>
    </Link>
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
      transition={{ duration: 0.65, delay, ease: [0.23, 1, 0.32, 1] }}
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
      <span className={`grid size-7 place-items-center rounded-full transition-transform duration-200 [transition-timing-function:var(--ease-apple-snappy)] group-hover:translate-x-0.5 ${secondary ? "bg-canvas text-txt-secondary" : "bg-primary-foreground/15 text-primary-foreground"}`}>
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,oklch(0.65_0.22_285_/_0.16),transparent_32%),radial-gradient(circle_at_15%_75%,oklch(0.35_0.12_285_/_0.1),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="max-w-xl">
          <Reveal>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Time in. Money out.</p>
            <h1 className="max-w-[10ch] text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-txt-primary sm:text-6xl lg:text-7xl">
              Know what your work is worth.
            </h1>
            <p className="mt-7 max-w-[42ch] text-pretty text-base leading-7 text-txt-secondary sm:text-lg">
              Invoicify keeps your hours, clients, and invoices in one clear place.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <IslandButton href="/register">Start tracking</IslandButton>
              <IslandButton href="/login" secondary>Sign in</IslandButton>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="relative lg:pl-6">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" aria-hidden="true" />
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  );
}

const previewStats = [
  ["Tracked this week", "27.4 hrs", "Goal 32 hrs"],
  ["Unbilled work", "$2,184", "18.2 hrs · 3 clients"],
  ["Awaiting payment", "$4,760", "3 invoices open"],
  ["Paid this month", "$8,940", "7 paid invoices"],
];

const previewClients = [
  ["Northline Studio", "7.5 hrs · $120/hr", "$900"],
  ["Morrow & Finch", "5.2 hrs · $145/hr", "$754"],
  ["Cedar House", "3.8 hrs · $140/hr", "$532"],
];

const previewLogs = [
  ["Product strategy workshop", "Northline Studio · 2 hrs ago", "2h 15m"],
  ["Homepage implementation", "Morrow & Finch · 5 hrs ago", "3h 40m"],
  ["Analytics review", "Cedar House · yesterday", "1h 20m"],
];

const previewInvoices = [
  ["INV-2026-018 · Northline Studio", "Due in 3 days", "$2,340", "Sent"],
  ["INV-2026-017 · Morrow & Finch", "Paid 2 days ago", "$1,880", "Paid"],
  ["INV-2026-016 · Cedar House", "Paid 5 days ago", "$1,420", "Paid"],
];

function DashboardPreview() {
  return (
    <div className="relative rounded-[2rem] bg-surface/60 p-1.5 shadow-[0_28px_80px_-36px_oklch(0_0_0_/_0.7)] ring-1 ring-white/10">
      <div className="overflow-hidden rounded-[1.65rem] border border-line/70 bg-canvas shadow-[inset_0_1px_0_oklch(1_0_0_/_0.06)]">
        <div className="flex items-center justify-between border-b border-line/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /><span className="text-[11px] font-semibold text-txt-primary">Dashboard</span></div>
          <span className="rounded-lg border border-line/70 bg-surface px-2 py-1 text-[9px] text-txt-muted">invoicify.app/dashboard</span>
          <span className="grid size-6 place-items-center rounded-lg border border-line/70 bg-surface text-txt-secondary"><Plus className="size-3" aria-hidden="true" /></span>
        </div>
        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
          <div className="flex items-end justify-between gap-4"><div><p className="text-base font-semibold tracking-tight text-txt-primary sm:text-lg">Good afternoon, Maya</p><p className="mt-1 text-[10px] text-txt-muted sm:text-xs">3 active clients · 3 invoices need sending</p></div><button className="hidden rounded-xl border border-line bg-surface px-3 py-2 text-[10px] font-semibold text-txt-primary sm:inline-flex">New invoice</button></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {previewStats.map(([label, value, note]) => <div key={label} className="rounded-xl border border-line/70 bg-surface p-3"><p className="text-[9px] text-txt-secondary">{label}</p><p className="mt-1 text-sm font-semibold tracking-tight text-txt-primary sm:text-base">{value}</p><p className="mt-1 truncate text-[8px] text-txt-muted">{note}</p></div>)}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
            <section className="rounded-xl border border-line/70 bg-surface p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-txt-primary">Hours this week</h3><span className="text-[9px] text-txt-muted">27.4 hrs</span></div><div className="mt-5 flex h-28 items-end gap-2">{[46, 70, 56, 82, 64, 18, 10].map((height, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"><div className={`w-full rounded-t-md ${index === 3 ? "bg-primary" : "bg-primary/25"}`} style={{ height: `${height}%` }} /><span className="text-[8px] text-txt-muted">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>)}</div></section>
            <section className="rounded-xl border border-line/70 bg-surface p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-txt-primary">Unbilled by client</h3><span className="text-[9px] text-txt-muted">18.2 hrs</span></div><div className="mt-2">{previewClients.map(([name, meta, amount]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><span className="text-[10px] font-semibold text-txt-primary">{amount}</span></div>)}</div></section>
          </div>
          <div className="grid gap-3 lg:grid-cols-2"><PreviewList title="Recent time logs" rows={previewLogs} /><PreviewInvoices /></div>
        </div>
      </div>
    </div>
  );
}

function PreviewList({ title, rows }: { title: string; rows: string[][] }) {
  return <section className="rounded-xl border border-line/70 bg-surface p-4"><h3 className="text-xs font-semibold text-txt-primary">{title}</h3><div className="mt-2">{rows.map(([name, meta, value]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><span className="shrink-0 text-[9px] font-medium text-txt-secondary">{value}</span></div>)}</div></section>;
}

function PreviewInvoices() {
  return <section className="rounded-xl border border-line/70 bg-surface p-4"><h3 className="text-xs font-semibold text-txt-primary">Invoices</h3><div className="mt-2">{previewInvoices.map(([name, meta, amount, status]) => <div key={name} className="flex items-center justify-between gap-2 border-b border-line/40 py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-txt-primary">{name}</p><p className="truncate text-[8px] text-txt-muted">{meta}</p></div><div className="flex shrink-0 items-center gap-2"><span className="text-[9px] font-semibold text-txt-primary">{amount}</span><span className={`rounded-md px-1.5 py-0.5 text-[8px] font-medium ${status === "Paid" ? "bg-status-paid-bg text-status-paid" : "bg-primary/10 text-primary"}`}>{status}</span></div></div>)}</div></section>;
}

function ProofStrip() {
  return <section className="border-y border-line/60 px-6 py-7"><div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xs text-sm font-medium leading-6 text-txt-secondary">A calmer way to run the work behind your work.</p><div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-txt-muted"><span className="inline-flex items-center gap-2"><Clock3 className="size-3.5 text-primary" /> Live time tracking</span><span className="inline-flex items-center gap-2"><FileText className="size-3.5 text-primary" /> Clean invoices</span><span className="inline-flex items-center gap-2"><WalletCards className="size-3.5 text-primary" /> No busywork</span></div></div></section>;
}

function Workflow() {
  const items = [{ icon: TimerReset, title: "Capture the hours", body: "Start a timer or add a finished session. Every entry stays attached to the right client." }, { icon: FileText, title: "Turn work into invoices", body: "Select unbilled time and create a polished invoice without rebuilding the details." }, { icon: WalletCards, title: "See what is outstanding", body: "Know what is paid, what is open, and which work still needs a nudge." }];
  return <section className="px-6 py-28 sm:py-36"><div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24"><Reveal><h2 className="max-w-[9ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-txt-primary sm:text-5xl">Less admin. More room to do the work.</h2><p className="mt-6 max-w-[34ch] text-sm leading-6 text-txt-secondary">Your workflow should show the business clearly, not create another one to manage.</p></Reveal><div className="grid gap-8 sm:grid-cols-3">{items.map(({ icon: Icon, title, body }, index) => <Reveal key={title} delay={index * 0.08}><article className="border-t border-line pt-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-12 text-base font-semibold text-txt-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-txt-secondary">{body}</p></article></Reveal>)}</div></div></section>;
}

function Closing() {
  return <section className="px-6 pb-28 sm:pb-36"><Reveal><div className="mx-auto grid max-w-6xl items-end gap-10 rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-[0_24px_70px_-34px_var(--primary)] sm:p-12 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">Make the next hour count</p><h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">Start with the work you already did.</h2></div><IslandButton href="/register" secondary>Open your workspace</IslandButton></div></Reveal></section>;
}

export function LandingPage() {
  return <main className="min-h-[100dvh] overflow-hidden bg-canvas text-txt-primary selection:bg-primary/20"><Hero /><ProofStrip /><Workflow /><Closing /></main>;
}
