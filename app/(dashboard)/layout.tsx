import { ReactNode } from "react";
import { Brand } from "../(marketing)/landing/landing-page";
import { requireUser } from "@/lib/auth/session";
import AccountDropDown from "@/components/dashboard/account-dropdown";
import Sidebar from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const { name, email, emailVerified } = user;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-txt-primary selection:bg-primary/20 transition-colors duration-200">
      <header className="sticky top-0 z-40 glass-header px-6 py-2.5 h-16 flex items-center transition-all">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brand />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AccountDropDown
              name={name}
              email={email}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        <Sidebar user={user} />
        <main className="min-w-0 flex-1 bg-canvas px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
