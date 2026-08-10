import { Brand } from "./landing/landing-page";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { SiGithub } from "react-icons/si";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default async function MarketLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser().catch(() => null);
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
          <p>Invoicify — Open Source Financial Telemetry</p>
          <p className="inline-flex items-center gap-2">
            Crafted by PrimeFold <SiGithub className="size-3.5" />
          </p>
        </div>
      </footer>
    </div>
  );
}
