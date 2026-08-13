import { AuthForm } from "@/components/auth/auth-form";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export default async function RegisterPage() {
  let user = null;
  try {
    const cookieStore = await cookies();
    const hasSessionCookie = cookieStore.getAll().some((c) => c.name.startsWith("better-auth"));
    if (hasSessionCookie) {
      user = await requireUser().catch(() => null);
    }
  } catch (error) {
    console.warn("Database connection issue bypassed during session verification in register page:", error);
  }

  if (user) redirect("/dashboard");

  return <AuthForm mode="register" />;
}
