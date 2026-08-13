"use client";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import BlurText from "@/components/BlurText";
import GradientWaves from "@/components/GradientWaves";
import SplitText from "@/components/SplitText";
import { benefits } from "./benefits";
import { featureCards } from "./feature-cards";

export function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-tight text-txt-primary active-press"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
        <ReceiptText className="size-4" aria-hidden="true" />
      </span>
      <span>Invoicify</span>
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* WebGL Wave Background */}
      <div className="absolute inset-0 z-0">
        <GradientWaves
          horizonColor="#491cff"
          waveColor="#FF9FFC"
          crestColor="#FFFFFF"
          speed={0.8}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.05}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 flex flex-col items-center justify-center">
        {/* Badge Container */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line/80 bg-surface/70 text-xs font-medium text-txt-secondary backdrop-blur-md shadow-2xs">
            <span className="size-1.5 rounded-full bg-status-paid animate-pulse" />
            Open source — free forever
          </div>
        </div>

        {/* Headline Container */}
        <div className="flex flex-col items-center justify-center mt-8">
          <SplitText
            text="Stop losing money"
            tag="h1"
            className="apple-display text-txt-primary text-center"
            delay={40}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px"
            textAlign="center"
          />
          <SplitText
            text="on unbilled hours."
            tag="span"
            className="apple-display text-txt-muted font-normal text-center mt-1"
            delay={40}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px"
            textAlign="center"
          />
        </div>

        {/* Subheadline Container */}
        <div className="flex items-center justify-center mt-8">
          <BlurText
            text="Track time. Generate invoices. Get paid. Built for freelancers who value clarity over complexity."
            className="max-w-xl text-base sm:text-lg leading-relaxed text-txt-secondary tracking-tight text-center justify-center"
            delay={80}
            animateBy="words"
            direction="bottom"
            stepDuration={0.4}
          />
        </div>

        {/* CTA Container */}
        <div className="flex items-center justify-center mt-10">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 rounded-xl px-6 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 active-press transition-all shadow-md shadow-primary/20"
            >
              Start tracking
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <Link
              href="https://github.com"
              className="inline-flex items-center justify-center h-11 rounded-xl px-6 text-sm font-medium bg-surface/80 text-txt-primary border border-line/80 hover:bg-surface-hover active-press transition-all backdrop-blur-sm shadow-sm"
            >
              <SiGithub className="mr-2 size-4" aria-hidden="true" />
              Source code
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Product Preview — Interactive Dashboard Mock
   ───────────────────────────────────────────── */

function ProductPreview() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-24">
      <div className="glass-panel overflow-hidden shadow-2xl">
        {/* Window Chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line/60 bg-canvas/30">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[oklch(0.65_0.20_25)]" />
            <span className="size-3 rounded-full bg-[oklch(0.80_0.16_85)]" />
            <span className="size-3 rounded-full bg-[oklch(0.70_0.18_148)]" />
          </div>
          <div className="flex-1 text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-lg bg-canvas/60 border border-line/40 text-[11px] text-txt-muted font-mono">
              invoicify.app/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metric Cards Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={DollarSign}
              label="Collected"
              value="$12,480"
              change="+18%"
              changeType="positive"
            />
            <MetricCard
              icon={Clock3}
              label="Hours Logged"
              value="186.5"
              change="This month"
              changeType="neutral"
            />
            <MetricCard
              icon={FileText}
              label="Unbilled"
              value="$2,840"
              change="24.5 hrs"
              changeType="warning"
            />
          </div>

          {/* Mini Table */}
          <div className="rounded-xl border border-line/60 bg-canvas/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-line/40 flex items-center justify-between">
              <span className="apple-label-caps text-[9px]">
                Recent Invoices
              </span>
              <span className="text-[10px] text-txt-muted font-sans">
                3 of 12
              </span>
            </div>
            <div className="divide-y divide-line/30">
              <InvoiceRow
                client="Acme Corp"
                number="INV-2026-012"
                amount="$3,200.00"
                status="paid"
              />
              <InvoiceRow
                client="Nebula Labs"
                number="INV-2026-011"
                amount="$1,840.00"
                status="paid"
              />
              <InvoiceRow
                client="Vertex AI"
                number="INV-2026-010"
                amount="$2,400.00"
                status="pending"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "warning" | "neutral";
}) {
  const changeStyles = {
    positive: "text-status-paid bg-status-paid-bg border-status-paid-border",
    warning:
      "text-status-pending bg-status-pending-bg border-status-pending-border",
    neutral: "text-txt-muted bg-canvas/60 border-line/60",
  };

  return (
    <div className="glass-card p-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="grid size-8 place-items-center rounded-lg border border-line/60 bg-canvas/60 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${changeStyles[changeType]}`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold font-sans tracking-tight text-txt-primary">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-txt-muted font-sans">{label}</p>
    </div>
  );
}

function InvoiceRow({
  client,
  number,
  amount,
  status,
}: {
  client: string;
  number: string;
  amount: string;
  status: "paid" | "pending";
}) {
  const isPaid = status === "paid";

  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs font-sans">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/8 border border-primary/15 text-primary text-[10px] font-bold">
          {client.substring(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-txt-primary truncate">{client}</p>
          <p className="text-[10px] text-txt-muted font-mono">{number}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono font-semibold text-txt-primary text-[11px]">
          {amount}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border ${
            isPaid
              ? "text-status-paid bg-status-paid-bg border-status-paid-border"
              : "text-status-pending bg-status-pending-bg border-status-pending-border"
          }`}
        >
          <span
            className={`size-1 rounded-full ${
              isPaid ? "bg-status-paid" : "bg-status-pending"
            }`}
          />
          {isPaid ? "PAID" : "PENDING"}
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Log your time",
      description:
        "Pick a client, describe the task, start the timer. Or enter hours manually. Your call.",
    },
    {
      step: "02",
      title: "Generate an invoice",
      description:
        "Select unbilled time entries, click generate. A formatted PDF is compiled server-side in milliseconds.",
    },
    {
      step: "03",
      title: "Share and get paid",
      description:
        "Copy a signed link, send it to your client. They view the invoice and download the PDF. No sign-up required.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 border-t border-line/60">
      <div className="text-center mb-16">
        <p className="apple-label-caps text-[10px]">How it works</p>
        <h2 className="mt-3 apple-heading text-txt-primary">
          Three steps. That's it.
        </h2>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {steps.map((item) => (
          <div key={item.step} className="text-left">
            <span className="inline-flex items-center justify-center size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-bold mb-4">
              {item.step}
            </span>
            <h3 className="text-base font-semibold text-txt-primary tracking-tight mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <div className="glass-card p-5 text-left active-press">
      <div className="flex items-center justify-between mb-4">
        <span className="grid size-9 place-items-center rounded-xl border border-line/60 bg-canvas/60 text-primary shadow-2xs">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="apple-label-caps text-[9px] border border-line/60 px-2.5 py-0.5 rounded-full bg-canvas/60 font-sans">
          {tag}
        </span>
      </div>
      <h3 className="font-semibold text-txt-primary text-sm tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-txt-secondary leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 border-t border-line/60">
      <div className="text-center mb-14">
        <p className="apple-label-caps text-[10px]">Features</p>
        <h2 className="mt-3 apple-heading text-txt-primary">
          Everything you need. Nothing you don't.
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Tech Stack Ribbon
   ───────────────────────────────────────────── */

function TechStack() {
  const tech = [
    "Next.js 15",
    "TypeScript",
    "React 19",
    "Prisma",
    "PostgreSQL",
    "Redis",
    "PDFKit",
    "Tailwind v4",
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t border-line/60">
      <p className="apple-label-caps text-[10px] text-center mb-8">
        Built with
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tech.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg border border-line/60 bg-surface/60 text-xs font-medium text-txt-secondary font-sans shadow-2xs"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Bottom CTA
   ───────────────────────────────────────────── */

function BottomCta() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 border-t border-line/60">
      <div className="glass-panel p-10 sm:p-14 text-center">
        <h2 className="apple-heading text-txt-primary mb-4">
          Your time is worth tracking.
        </h2>
        <p className="text-sm text-txt-secondary max-w-md mx-auto mb-8 leading-relaxed">
          Set up in under a minute. Start logging hours, generating invoices,
          and getting paid for every minute of work you deliver.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-11 rounded-xl px-6 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 active-press transition-all shadow-md shadow-primary/20"
          >
            Create free account
            <ChevronRight className="ml-1.5 size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-11 rounded-xl px-6 text-sm font-medium text-txt-secondary hover:text-txt-primary active-press transition-colors"
          >
            Sign in to existing account
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Benefits Bar
   ───────────────────────────────────────────── */

function BenefitsBar() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12 border-t border-line/60">
      <ul className="flex flex-col justify-center gap-4 text-xs font-medium text-txt-secondary sm:flex-row sm:gap-8">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center justify-center gap-2">
            <Check
              className="size-4 shrink-0 text-status-paid"
              aria-hidden="true"
            />
            {benefit}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Landing Page (Composed)
   ───────────────────────────────────────────── */

export function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas text-txt-primary antialiased selection:bg-primary/20">
      <Hero />
      <div className="relative mx-auto max-w-6xl">
        <ProductPreview />
        <HowItWorks />
        <Features />
        <TechStack />
        <BenefitsBar />
        <BottomCta />
      </div>
    </main>
  );
}
