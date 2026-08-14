import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SiGithub } from "react-icons/si";
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
            <ThemeToggle />
            <Link href="/login" className="active-press rounded-full px-3 py-2 text-xs font-medium text-txt-secondary transition-colors hover:text-txt-primary">Sign in</Link>
            <Link href="/register" className="active-press rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Start tracking</Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-line/60 px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-xs text-txt-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Invoicify. Time tracking and invoicing for freelancers.</p>
          <a href="https://github.com" className="inline-flex items-center gap-2 transition-colors hover:text-txt-primary" rel="noreferrer">
            Open source <SiGithub className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
