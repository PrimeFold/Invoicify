import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border border-line bg-surface shadow-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform duration-200 group-hover:scale-105">
              <FileText className="size-5" />
            </span>
            <span className="font-bold text-xl text-txt-primary tracking-tight">Invoicify</span>
          </Link>
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-txt-primary">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-txt-secondary">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
