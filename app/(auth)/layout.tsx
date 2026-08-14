import { FileText } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-105">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <FileText className="size-6" />
          </span>
          <span className="font-bold text-2xl tracking-tight text-txt-primary">Invoicify</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
