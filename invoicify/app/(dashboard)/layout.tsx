import { ReactNode } from "react";
import { Brand } from "../(marketing)/landing/landing-page";
import { requireUser } from "@/lib/auth/session";
import AccountDropDown from "@/components/dashboard/account-dropdown";
import Sidebar from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const { name, email, emailVerified } = user;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-txt-primary">
      <header className="border-b border-line px-6 py-2 bg-canvas h-15">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div>
            <Brand />
          </div>
          <div className="flex items-center gap-8">
            <AccountDropDown name={name} email={email} emailVerified={emailVerified} />
          </div>
        </div>
      </header>
      <div className="flex flex-1 mx-25">
        <Sidebar/>
        <main className="py-8 bg-red-200">
          {children}
        </main>
        </div>
    </div>
  );
}

