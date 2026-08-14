import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SiGithub, SiInstagram, SiX } from "react-icons/si";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { requireUser } from "@/lib/auth/session";
import { Brand } from "./landing/landing-page";

export default async function MarketLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user = null;
  try {
    const cookieStore = await cookies();
    const hasSessionCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith("better-auth"));
    if (hasSessionCookie) {
      user = await requireUser().catch(() => null);
    }
  } catch (error) {
    console.warn(
      "Database connection issue bypassed during session verification in marketing layout:",
      error
    );
  }

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-txt-primary transition-colors duration-200">
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-line/70 bg-glass-surface px-4 py-2.5 shadow-[0_12px_32px_-24px_oklch(0_0_0_/_0.7)] backdrop-blur-xl sm:px-5">
          <Brand />
          <nav aria-label="Primary navigation" className="flex items-center gap-1.5">
            <Link href="/#why" className="hidden rounded-full px-3 py-2 text-xs font-medium text-txt-secondary transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary lg:inline-flex">Why I built it</Link>
            <Link href="/#features" className="hidden rounded-full px-3 py-2 text-xs font-medium text-txt-secondary transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary lg:inline-flex">Features</Link>
            <ThemeToggle />
            <Link href="/login" className="active-press rounded-full px-3 py-2 text-xs font-medium text-txt-secondary transition-colors hover:text-txt-primary">Sign in</Link>
            <Link href="/register" className="active-press rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Start tracking</Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-line/60 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 text-xs text-txt-muted sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p>Invoicify. Time tracking and invoicing for freelancers.</p>
            <p className="mt-2 max-w-sm leading-5">Built because I wanted fewer spreadsheets, fewer late nights, and a clearer view of the work already done.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://github.com/PrimeFold/Invoicify" className="inline-flex items-center gap-2 transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary" rel="noreferrer">GitHub <SiGithub className="size-3.5" aria-hidden="true" /></a>
            <a href="https://instagram.com" className="transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary" rel="noreferrer" aria-label="Instagram"><SiInstagram className="size-4" aria-hidden="true" /></a>
            <a href="https://x.com" className="transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary" rel="noreferrer" aria-label="X"><SiX className="size-4" aria-hidden="true" /></a>
            <a href="https://linkedin.com" className="transition-colors duration-200 [transition-timing-function:var(--ease-apple-snappy)] hover:text-txt-primary" rel="noreferrer" aria-label="LinkedIn"><span className="text-xs font-semibold" aria-hidden="true">in</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
