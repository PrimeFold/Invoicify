"use client";

import { useState } from "react";
import { UserDetails } from "@/types/user";
import {
  Clock3,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  ReceiptText,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";

const sections = [
  {
    title: "Main",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        badge: undefined,
      },
      {
        href: "/clients",
        label: "Clients",
        icon: Users,
        badge: undefined,
      },
      {
        href: "/timelogs",
        label: "Time Logs",
        icon: Clock3,
        badge: "Live",
      },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        href: "/invoices",
        label: "Invoices",
        icon: ReceiptText,
        badge: undefined,
      },
    ],
  },
];

export default function Sidebar({ user }: { user?: UserDetails }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPromo, setShowPromo] = useState(true);
  const userName = user?.name || "Aditya Raj";
  const userEmail = user?.email || "aditya@invoicify.dev";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-line/70 bg-canvas/40 backdrop-blur-md">
      <div className="sticky top-0 flex h-screen flex-col justify-between p-4">
        {/* Navigation Links */}
        <div className="space-y-5 pt-1">
          <nav className="space-y-5">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-1.5 px-3 apple-label-caps text-[10px]">
                  {section.title}
                </p>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                      <NavItem key={item.href} {...item} active={isActive} />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Promo Card + User Profile */}
        <div className="space-y-3 pt-3 border-t border-line/60">
          {/* Workshop Live Promo Card (as shown in reference image) */}
          {showPromo ? (
            <div className="relative rounded-2xl border border-line/80 bg-surface/90 p-3.5 shadow-sm text-left font-sans">
              <button
                type="button"
                onClick={() => setShowPromo(false)}
                className="absolute right-2.5 top-2.5 p-1 text-txt-muted hover:text-txt-primary rounded-lg transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>

              {/* Avatar Stack */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <span className="inline-block size-6 rounded-full ring-2 ring-surface bg-primary/20 text-[10px] font-bold font-sans text-primary grid place-items-center">
                    SH
                  </span>
                  <span className="inline-block size-6 rounded-full ring-2 ring-surface bg-status-paid-bg text-[10px] font-bold font-sans text-status-paid grid place-items-center">
                    LC
                  </span>
                  <span className="inline-block size-6 rounded-full ring-2 ring-surface bg-status-pending-bg text-[10px] font-bold font-sans text-status-pending grid place-items-center">
                    CK
                  </span>
                </div>
                <span className="rounded-full bg-surface-hover px-1.5 py-0.5 font-mono text-[9px] font-semibold text-txt-muted">
                  +5
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <p className="font-sans text-xs font-semibold text-txt-primary">
                  Join our workshop
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-status-paid-border bg-status-paid-bg px-1.5 py-0.2 font-mono text-[9px] font-medium text-status-paid">
                  <span className="size-1 rounded-full bg-status-paid animate-ping" />
                  Live
                </span>
              </div>

              <p className="font-sans text-[11px] text-txt-secondary leading-tight mb-3">
                Learn how to leverage Invoicify to supercharge your workflow.
              </p>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowPromo(false)}
                  className="text-txt-muted hover:text-txt-primary transition-colors cursor-pointer text-[11px]"
                >
                  Dismiss
                </button>
                <a
                  href="#workshop"
                  className="text-primary hover:underline transition-all text-[11px]"
                >
                  Join now!
                </a>
              </div>
            </div>
          ) : null}

          {/* User Account Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-hover/80 active-press transition-colors border border-transparent hover:border-line/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20 font-sans text-xs font-semibold text-primary shadow-xs">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-txt-primary truncate">
                  {userName}
                </p>
                <p className="font-sans text-[10px] text-txt-muted truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-txt-muted hover:text-destructive hover:bg-destructive/10 active-press border border-transparent hover:border-destructive/20 transition-all cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center justify-between rounded-xl px-3 py-2 font-sans text-xs transition-all active-press",
        active
          ? "bg-surface text-txt-primary border border-line shadow-xs font-semibold"
          : "text-txt-secondary hover:bg-surface-hover/70 hover:text-txt-primary border border-transparent",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          className={[
            "size-4 transition-colors",
            active
              ? "text-primary"
              : "text-txt-muted group-hover:text-txt-primary",
          ].join(" ")}
        />
        <span className="tracking-tight">{label}</span>
      </div>

      {badge ? (
        <span className="font-sans text-[10px] px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium shadow-2xs">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
