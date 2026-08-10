"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock3,
  ReceiptText,
  LogOut,
  type LucideIcon,
} from "lucide-react";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-line/70 bg-canvas/40 backdrop-blur-md">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
        {/* Navigation Links */}
        <div className="space-y-6 pt-2">
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 apple-label-caps text-[10px]">
                  {section.title}
                </p>

                <div className="space-y-1">
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

        {/* Bottom Section: Workspace Status + User Profile */}
        <div className="space-y-3 pt-4 border-t border-line/60">
          {/* System Status Widget */}
          <div className="glass-card p-3 bg-surface/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-txt-muted">
              <span className="text-[11px] font-medium text-txt-secondary">System Status</span>
              <span className="inline-flex items-center gap-1.5 text-status-paid font-medium text-[11px]">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-paid opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-status-paid" />
                </span>
                Operational
              </span>
            </div>
          </div>

          {/* User Account Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-hover/80 active-press transition-colors border border-transparent hover:border-line/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20 font-sans text-xs font-semibold text-primary shadow-xs">
                AR
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-txt-primary truncate">
                  Aditya Raj
                </p>
                <p className="font-sans text-[10px] text-txt-muted truncate">
                  aditya@invoicify.dev
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface/80 active-press border border-transparent hover:border-line/60 transition-all"
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
        "group relative flex items-center justify-between rounded-xl px-3 py-2.5 font-sans text-xs transition-all active-press",
        active
          ? "bg-surface text-txt-primary border border-line shadow-xs font-semibold"
          : "text-txt-secondary hover:bg-surface-hover/70 hover:text-txt-primary border border-transparent",
      ].join(" ")}
    >
      {/* Active Indicator Accent Line */}
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-xs" />
      )}

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
        <span className="font-sans text-[10px] px-2 py-0.5 rounded-full border border-status-pending-border bg-status-pending-bg text-status-pending font-medium shadow-2xs">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
