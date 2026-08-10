import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, Info, ReceiptText, Sparkles } from "lucide-react";
import { SiGithub } from "react-icons/si";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { featureCards } from "./feature-cards";
import { benefits } from "./benefits";

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

export function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center h-11 rounded-xl px-5 text-sm font-medium transition-all active-press cursor-pointer shadow-sm ${
        isPrimary
          ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
          : "bg-surface/80 text-txt-primary border border-line/80 hover:bg-surface-hover backdrop-blur-sm"
      }`}
    >
      {children}
    </Link>
  );
}

export function FeatureCard({
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
    <Card className="glass-card gap-0 text-left active-press overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="grid size-9 place-items-center rounded-xl border border-line/60 bg-canvas/60 text-primary shadow-2xs">
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <span className="apple-label-caps text-[9px] border border-line/60 px-2.5 py-0.5 rounded-full bg-canvas/60 font-sans">
            {tag}
          </span>
        </div>
        <CardTitle className="font-semibold text-txt-primary text-base tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="leading-relaxed text-txt-secondary text-xs mt-1.5 font-sans">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function Metric({
  label,
  value,
  note,
  tooltip,
}: {
  label: string;
  value: string;
  note: string;
  tooltip?: string;
}) {
  return (
    <div className="glass-card p-4 text-left active-press">
      <div className="flex items-center gap-1.5 apple-label-caps text-[10px]">
        <span>{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="cursor-pointer inline-flex items-center">
              <Info
                className="size-3 text-txt-muted hover:text-txt-secondary"
                aria-hidden="true"
              />
            </TooltipTrigger>
            <TooltipContent className="glass-panel text-txt-primary font-sans text-xs p-2 shadow-lg">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-1.5 text-2xl font-bold font-sans tracking-tight text-txt-primary">
        {value}
      </p>
      <p className="mt-1 text-xs text-txt-secondary tracking-tight">{note}</p>
    </div>
  );
}

export function InvoicePreview() {
  return (
    <Card className="relative mx-auto mt-12 w-full max-w-4xl gap-0 glass-panel text-left shadow-2xl overflow-hidden border-line/80">
      <CardHeader className="flex-row items-center justify-between px-6 py-4.5 border-b border-line/60 bg-canvas/30">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-xl bg-canvas border border-line/60 text-primary font-sans text-xs font-semibold shadow-2xs">
            01
          </span>
          <div>
            <p className="text-xs font-semibold font-sans text-txt-primary tracking-tight">
              Invoice Summary — July 2026
            </p>
            <p className="text-[10px] text-txt-muted font-sans">
              Client Account Overview
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-status-paid-bg text-status-paid border border-status-paid-border shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-status-paid animate-pulse" />
          Active Ledger
        </span>
      </CardHeader>

      <CardContent className="grid gap-3 p-6 sm:grid-cols-3 border-b border-line/60">
        <Metric
          label="Unbilled Revenue"
          value="$2,840.00"
          note="18.5 hrs logged"
          tooltip="Tracked time pending invoice assembly."
        />
        <Metric
          label="Paid This Month"
          value="$6,450.00"
          note="12 invoices collected"
        />
        <Metric
          label="Outstanding"
          value="$1,200.00"
          note="2 invoices UNPAID"
        />
      </CardContent>

      <CardContent className="p-6">
        <div className="rounded-xl border border-line/60 bg-canvas/40 p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-sans">
            <span className="apple-label-caps text-[9px]">
              Unbilled Time Logs
            </span>
            <span className="text-txt-muted text-[11px]">Client: Acme Corp ($80/hr)</span>
          </div>
          <div className="space-y-2.5">
            {[
              {
                title: "Route Handlers & PDF Generator Integration",
                time: "06:30:00",
                cost: "$520.00",
              },
              {
                title: "Transaction Pipeline & Schema Optimization",
                time: "04:15:00",
                cost: "$340.00",
              },
              {
                title: "Dashboard Analytics & Financial Metrics",
                time: "02:00:00",
                cost: "$160.00",
              },
            ].map((entry) => (
              <div
                key={entry.title}
                className="flex items-center justify-between text-xs border-b border-line/40 pb-2.5 last:border-0 last:pb-0"
              >
                <span className="text-txt-secondary font-sans font-medium truncate max-w-[280px] sm:max-w-none">
                  {entry.title}
                </span>
                <div className="flex items-center gap-4 font-sans text-[11px]">
                  <span className="text-txt-muted">{entry.time}</span>
                  <span className="text-txt-primary font-semibold">
                    {entry.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  return (
    <TooltipProvider>
      <main className="min-h-screen bg-canvas text-txt-primary antialiased selection:bg-primary/20">
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="py-16 text-center sm:py-24">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-line/80 bg-surface/80 text-xs font-medium text-txt-secondary backdrop-blur-md shadow-2xs">
              <Sparkles
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              Modern Fluid Invoicing Platform
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl apple-display text-balance text-txt-primary">
              Turn active work hours into{" "}
              <span className="text-txt-muted font-normal">polished, professional invoices.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-txt-secondary sm:text-lg tracking-tight">
              Seamlessly log billable hours, track client rates, and generate beautiful
              PDF invoices with zero latency.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink href="/register">
                Get Started Free{" "}
                <ArrowRight
                  className="ml-1.5 size-4 inline"
                  aria-hidden="true"
                />
              </CtaLink>
              <CtaLink href="https://github.com" variant="secondary">
                <SiGithub className="mr-1.5 size-4 inline" aria-hidden="true" />{" "}
                View Source
              </CtaLink>
            </div>

            <InvoicePreview />
          </div>

          <section id="features" className="py-20 border-t border-line/60">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="apple-label-caps text-[10px]">
                Platform Architecture
              </p>
              <h2 className="mt-2 apple-heading text-txt-primary">
                Engineered for speed, clarity, and reliability.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </section>

          <section
            id="how-it-works"
            className="border-t border-line/60 py-14 text-center"
          >
            <ul className="flex flex-col justify-center gap-4 text-xs font-medium text-txt-secondary sm:flex-row sm:gap-8">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center justify-center gap-2"
                >
                  <Check
                    className="size-4 shrink-0 text-status-paid"
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <footer className="border-t border-line/60 py-8 text-center text-xs font-sans text-txt-muted flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>Invoicify — High performance client billing & time tracking.</p>
            <p>Crafted by PrimeFold</p>
          </footer>
        </div>
      </main>
    </TooltipProvider>
  );
}
