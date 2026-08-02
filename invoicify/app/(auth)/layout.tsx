import { requireUser } from "@/lib/auth/session";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-mono text-base font-semibold text-txt-primary">
          <span className="grid size-9 place-items-center rounded-md bg-surface border border-line text-txt-primary">
            <ReceiptText className="size-5" />
          </span>
          Invoicify
        </Link>
      </div>

      <div className="w-full max-w-md bg-surface border border-line rounded-lg p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}



