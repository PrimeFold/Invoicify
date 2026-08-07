import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, Info, ReceiptText, Terminal } from "lucide-react";
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
      className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-txt-primary"
    >
      <span className="grid size-8 place-items-center rounded-md bg-surface border border-line text-txt-primary">
        <ReceiptText className="size-4" aria-hidden="true" />
      </span>
      Invoicify{" "}
      <span className="text-txt-muted text-xs font-normal">[v1.0]</span>
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
      className={`inline-flex items-center justify-center h-11 rounded-md px-5 text-sm font-medium transition-all cursor-pointer ${
        isPrimary
          ? "bg-txt-primary text-canvas hover:opacity-90"
          : "bg-surface text-txt-primary border border-line hover:bg-surface-hover"
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
    <Card className="gap-0 rounded-lg border-line bg-surface py-0 shadow-none text-left">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="grid size-9 place-items-center rounded-md border border-line bg-canvas text-txt-primary">
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <span className="font-mono text-[10px] text-txt-muted tracking-wider uppercase border border-line px-2 py-0.5 rounded bg-canvas">
            {tag}
          </span>
        </div>
        <CardTitle className="font-semibold text-txt-primary text-base">
          {title}
        </CardTitle>
        <CardDescription className="leading-6 text-txt-secondary text-sm mt-1.5">
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
    <div className="rounded-md border border-line bg-canvas p-4">
      <div className="flex items-center gap-1.5 text-xs font-mono text-txt-muted uppercase">
        <span>{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="cursor-pointer inline-flex items-center">
              <Info
                className="size-3 text-txt-muted hover:text-txt-secondary"
                aria-hidden="true"
              />
            </TooltipTrigger>
            <TooltipContent className="bg-surface border-line text-txt-primary font-sans text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-1.5 text-2xl font-semibold font-mono tracking-tight text-txt-primary">
        {value}
      </p>
      <p className="mt-1 text-xs font-mono text-txt-secondary">{note}</p>
    </div>
  );
}

export function InvoicePreview() {
  return (
    <Card className="relative mx-auto mt-12 w-full max-w-4xl gap-0 rounded-lg border-line bg-surface py-0 text-left shadow-2xl">
      <CardHeader className="flex-row items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded bg-canvas border border-line text-txt-primary font-mono text-xs">
            01
          </span>
          <div>
            <p className="text-sm font-medium font-mono text-txt-primary">
              INVOICE_OVERVIEW // JUL-2026
            </p>
            <p className="text-xs text-txt-muted font-mono">
              USER_ID: usr_89f3a1
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-status-paid-bg text-status-paid border border-status-paid-border">
          <span className="h-1.5 w-1.5 rounded-full bg-status-paid" />
          ACTIVE_LEDGER
        </span>
      </CardHeader>

      <CardContent className="grid gap-3 p-5 sm:grid-cols-3 border-b border-line">
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

      <CardContent className="p-5">
        <div className="rounded-md border border-line bg-canvas p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-mono">
            <span className="text-txt-secondary uppercase tracking-wider">
              Unbilled Time Logs
            </span>
            <span className="text-txt-muted">Client: Acme Corp ($80/hr)</span>
          </div>
          <div className="space-y-2.5">
            {[
              {
                title: "Next.js Route Handlers & PDFKit Integration",
                time: "06:30:00",
                cost: "$520.00",
              },
              {
                title: "Prisma $transaction pipeline & Schema Migration",
                time: "04:15:00",
                cost: "$340.00",
              },
              {
                title: "Recharts Dashboard & Metric Calculation",
                time: "02:00:00",
                cost: "$160.00",
              },
            ].map((entry) => (
              <div
                key={entry.title}
                className="flex items-center justify-between text-xs font-mono border-b border-line/50 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-txt-secondary truncate max-w-[280px] sm:max-w-none">
                  {entry.title}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-txt-muted">{entry.time}</span>
                  <span className="text-txt-primary font-medium">
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
      <main className="min-h-screen bg-canvas text-txt-primary antialiased">
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="py-16 text-center sm:py-20">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-txt-secondary">
              <Terminal
                className="size-3.5 text-txt-primary"
                aria-hidden="true"
              />
              DEVELOPER-FIRST INVOICING ENGINE
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl text-txt-primary">
              Turn active work hours into{" "}
              <span className="text-txt-muted">vector-perfect invoices.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-txt-secondary sm:text-lg">
              Log billable hours, track client rates, and stream server-side
              vector PDFs directly with Next.js, Prisma, and PostgreSQL.
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

          <section id="features" className="py-16 border-t border-line">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <p className="text-xs font-mono text-txt-muted uppercase tracking-wider">
                [ SYSTEM ARCHITECTURE ]
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-txt-primary sm:text-3xl">
                Engineered for speed and data accuracy.
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
            className="border-t border-line py-12 text-center"
          >
            <ul className="flex flex-col justify-center gap-4 text-xs font-mono text-txt-secondary sm:flex-row sm:gap-8">
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

          <footer className="border-t border-line py-8 text-center text-xs font-mono text-txt-muted flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>Invoicify — Distributed under the MIT License.</p>
            <p>Crafted by PrimeFold</p>
          </footer>
        </div>
      </main>
    </TooltipProvider>
  );
}
