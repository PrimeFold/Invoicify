import type { ReactNode } from "react";
import Image from "next/image";
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
        <div className="flex items-center gap-2.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src="/invoicify-purple-logo-set/invoicify-app-icon.svg"
              alt="Invoicify logo"
              width={36}
              height={36}
              className="size-9 rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105"
            />
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
