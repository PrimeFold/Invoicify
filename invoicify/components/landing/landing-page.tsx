import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Clock3,
  FileText,
  Info,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "indigo" | "teal" | "amber";
};

const featureCards: FeatureCardProps[] = [
  {
    icon: Clock3,
    title: "Track time",
    description: "Keep billable work accurate without interrupting your flow.",
    tone: "indigo",
  },
  {
    icon: FileText,
    title: "Send clear invoices",
    description: "Turn approved time into professional, itemized invoices.",
    tone: "teal",
  },
  {
    icon: WalletCards,
    title: "Know what is owed",
    description: "See unbilled work and upcoming payments at a glance.",
    tone: "amber",
  },
];

const benefits = [
  "Simple client and rate management",
  "A clear record of every billable hour",
  "Invoice-ready work, without spreadsheets",
];

const toneClasses = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
};

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950">
      <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
        <ReceiptText className="size-5" aria-hidden="true" />
      </span>
      Invoicify
    </Link>
  );
}

export function CtaLink({ href, children, variant = "primary" }: CtaLinkProps) {
  return (
    <Button
      render={<a href={href} />}
      nativeButton={false}
      variant={variant === "primary" ? "default" : "outline"}
      size="lg"
      className="h-12 rounded-xl px-5 shadow-sm"
    >
      {children}
    </Button>
  );
}

export function FeatureCard({ icon: Icon, title, description, tone }: FeatureCardProps) {
  return (
    <Card className="gap-0 rounded-2xl border-slate-200 py-0 shadow-sm shadow-slate-200/50">
      <CardHeader className="px-6 pt-6">
        <span className={`mb-4 grid size-10 place-items-center rounded-xl ring-1 ${toneClasses[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription className="leading-6 text-slate-600">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function LandingHeader() {
  return (
    <header className="flex items-center justify-between py-5">
      <Brand />
      <Button
        render={<a href="#features" />}
        nativeButton={false}
        variant="ghost"
        size="sm"
        className="font-semibold text-slate-600"
      >
        Explore features
      </Button>
    </header>
  );
}

function InvoicePreview() {
  return (
    <Card className="relative mx-auto mt-14 w-full max-w-4xl gap-0 rounded-2xl border-slate-200 py-0 shadow-xl shadow-indigo-950/10">
      <CardHeader className="flex-row items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <ReceiptText className="size-5" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">July overview</p>
            <p className="text-xs text-slate-500">A clear view of your work</p>
          </div>
        </div>
        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50">On track</Badge>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-3 px-4 py-5 text-left sm:grid-cols-3 sm:px-6">
        <Metric label="Unbilled" value="$2,840" note="18.5 hours" />
        <Metric label="Paid this month" value="$6,450" note="12 invoices" />
        <Metric label="Outstanding" value="$1,200" note="2 invoices" />
      </CardContent>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="rounded-xl bg-slate-50 p-4 text-left">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Recent time entries</span>
          <span className="text-slate-500">This week</span>
        </div>
        <div className="space-y-3">
          {["Website redesign", "Product consulting", "Brand workshop"].map((entry, index) => (
            <div key={entry} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{entry}</span>
              <span className="font-medium text-slate-900">{["6h 30m", "4h 15m", "2h 00m"][index]}</span>
            </div>
          ))}
        </div>
      </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
        {label}
        {label === "Unbilled" && (
          <Tooltip>
            <TooltipTrigger render={<button type="button" aria-label="About unbilled revenue" />}>
              <Info className="size-3 text-slate-400" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Tracked time that has not been added to an invoice yet.</TooltipContent>
          </Tooltip>
        )}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <TooltipProvider>
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      <div className="absolute inset-x-0 top-0 -z-0 h-[38rem] bg-[radial-gradient(circle_at_50%_0%,#e0e7ff_0%,rgba(238,242,255,0.72)_38%,transparent_72%)]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <LandingHeader />

        <section className="py-16 text-center sm:py-24">
          <Badge className="mx-auto h-auto border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
            <Sparkles className="size-4" aria-hidden="true" />
            Built for independent teams
          </Badge>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Give your work the <span className="text-indigo-600">clarity it deserves.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Invoicify brings time, clients, and invoices together in one calm, straightforward workspace.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href="#how-it-works">See how it works <ArrowRight className="size-4" aria-hidden="true" /></CtaLink>
            <CtaLink href="#features" variant="secondary">Explore features</CtaLink>
          </div>
          <InvoicePreview />
        </section>

        <section id="features" className="pb-20 sm:pb-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-indigo-600">Everything in its place</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">A lighter way to run your billing.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-slate-200 py-10 text-center">
          <p className="text-sm font-semibold text-indigo-600">A simpler workflow</p>
          <ul className="mt-4 flex flex-col justify-center gap-3 text-sm text-slate-600 sm:flex-row sm:gap-7">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center justify-center gap-2">
                <Check className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
    </TooltipProvider>
  );
}
