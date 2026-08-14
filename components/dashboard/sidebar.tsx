"use client";

import { useState } from "react";
import { UserDetails } from "@/types/user";
import {
  Clock3,
  HelpCircle,
  Menu,
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
  {
    title: "Account",
    items: [
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        badge: undefined,
      },
    ],
  },
];

export default function Sidebar({ user }: { user?: UserDetails }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPromo, setShowPromo] = useState(false);
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
    <>
      <div className="flex items-center justify-between border-b border-line/60 px-4 py-3 md:hidden">
        <span className="text-xs font-semibold text-txt-secondary">Workspace</span>
        <button type="button" aria-expanded={showPromo} aria-label="Open workspace navigation" onClick={() => setShowPromo((value) => !value)} className="active-press grid size-9 place-items-center rounded-xl border border-line bg-surface text-txt-primary">
          <Menu className="size-4" aria-hidden="true" />
        </button>
      </div>
      <aside className={`${showPromo ? "block" : "hidden"} w-full shrink-0 border-b border-line/70 bg-canvas/95 backdrop-blur-md md:block md:w-64 md:border-b-0 md:border-r`}>
      <div className="sticky top-0 flex min-h-0 flex-col justify-between p-4 md:h-[calc(100dvh-4rem)]">
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

        {/* Bottom Section: User Profile */}
        <div className="pt-3 border-t border-line/60">

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
    </>
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
