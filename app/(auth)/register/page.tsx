import { AuthForm } from "@/components/auth/auth-form";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await requireUser().catch(() => null);
  if (user) redirect("/dashboard");

  return <AuthForm mode="register" />;
}
