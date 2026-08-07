import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function PageShell({
  children,
  className,
  centered = false,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-slate-50 text-slate-950",
        centered && "flex items-center justify-center",
        className
      )}
    >
      {children}
    </main>
  );
}
