import type { ReactNode } from "react";
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
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-txt-primary">
          {title}
        </CardTitle>
        <CardDescription className="text-txt-secondary">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
