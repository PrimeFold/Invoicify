"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock3,
  ReceiptText,
  Settings2,
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
      },
      {
        href: "/clients",
        label: "Clients",
        icon: Users,
      },
      {
        href: "/timelogs",
        label: "Time Logs",
        icon: Clock3,
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
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        href: "/settings",
        label: "Settings",
        icon: Settings2,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 ">
      <div className="sticky top-0 flex h-[calc(100vh-81px)] flex-col">
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <div key={section.title} className="mb-8">
              <p className="mb-3 px-3 text-[10px] font-mono uppercase tracking-[0.22em] text-txt-muted">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-txt-muted">
              Workspace
            </p>

            <p className="mt-2 font-medium text-txt-primary">
              Invoicify
            </p>

            <p className="mt-1 font-mono text-xs text-txt-secondary">
              developer-first invoicing
            </p>
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
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
        active
          ? "border border-line bg-surface text-txt-primary"
          : "text-txt-secondary hover:bg-surface hover:text-txt-primary",
      ].join(" ")}
    >
      <span
        className={[
          "grid size-8 place-items-center rounded-md border transition-colors",
          active
            ? "border-line bg-canvas text-txt-primary"
            : "border-line bg-canvas text-txt-muted group-hover:text-txt-primary",
        ].join(" ")}
      >
        <Icon className="size-4" />
      </span>

      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}