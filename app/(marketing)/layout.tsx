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
      {/* Shared Header */}
      <header className="sticky top-0 z-40 glass-header py-3.5 px-6">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <Brand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="font-sans text-xs font-medium text-txt-secondary hover:text-txt-primary px-3 py-1.5 transition-colors active-press"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground font-sans font-medium text-xs px-4 py-2 rounded-xl hover:opacity-90 active-press transition-all shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-line/60 py-8 px-6">
        <div className="max-w-6xl w-full mx-auto text-xs font-sans text-txt-muted flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>Invoicify — Time tracking and invoicing for freelancers</p>
          <p className="inline-flex items-center gap-2">
            Open Source <SiGithub className="size-3.5" />
          </p>
        </div>
      </footer>
    </div>
  );
}
