"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock3,
  ReceiptText,
  Terminal,
  LogOut,
  type LucideIcon,
} from "lucide-react";

const sections = [
  {
    title: "MAIN",
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
        badge: "LIVE",
      },
    ],
  },
  {
    title: "BILLING",
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
    <aside className="w-64 shrink-0 border-r border-line bg-canvas">
      <div className="sticky top-0 flex h-screen flex-col justify-between p-4">
        {/* Top Header & Brand */}
        <div className="space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-txt-muted">
                  [{section.title}]
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                      <NavItem
                        key={item.href}
                        {...item}
                        active={isActive}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Workspace Info + User Profile */}
        <div className="space-y-3 pt-4 border-t border-line">
          {/* Engine Status Widget */}
          <div className="rounded-md border border-line bg-canvas/60 p-3 font-mono text-[11px]">
            <div className="flex items-center justify-between text-txt-muted mb-1">
              <span className="uppercase tracking-wider">ENGINE_STATUS</span>
              <span className="inline-flex items-center gap-1 text-status-paid">
                <span className="h-1.5 w-1.5 rounded-full bg-status-paid animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-txt-secondary text-[10px] truncate">
              Database: Prisma PostgreSQL
            </p>
          </div>

          {/* User Account Bar */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-hover/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-7 shrink-0 place-items-center rounded bg-canvas border border-line font-mono text-xs font-semibold text-txt-primary">
                AR
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-txt-primary truncate">Aditya Raj</p>
                <p className="font-mono text-[10px] text-txt-muted truncate">aditya@invoicify.dev</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Sign out"
              className="p-1.5 rounded text-txt-muted hover:text-txt-primary hover:bg-canvas border border-transparent hover:border-line transition-all"
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
        "group relative flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs transition-all",
        active
          ? "bg-canvas text-txt-primary border border-line shadow-xs font-semibold"
          : "text-txt-secondary hover:bg-surface-hover hover:text-txt-primary border border-transparent",
      ].join(" ")}
    >
      {/* Active Indicator Accent Line */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-txt-primary" />
      )}

      <div className="flex items-center gap-2.5">
        <Icon
          className={[
            "size-4 transition-colors",
            active ? "text-txt-primary" : "text-txt-muted group-hover:text-txt-primary",
          ].join(" ")}
        />
        <span>{label}</span>
      </div>

      {badge ? (
        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded border border-status-pending-border bg-status-pending-bg text-status-pending font-normal">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
