"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = isLogin
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });

      if (result.error) {
        const message = result.error.message || "Authentication failed.";
        const friendlyMessage = message.toLowerCase().includes("user not found")
          ? "User not found"
          : message;

        setError(friendlyMessage);
        toast.error({
          title: "Authentication failed",
          description: friendlyMessage,
        });
        return;
      }

      // After successful auth: login -> dashboard, signup -> redirect to sign in
      if (isLogin) {
        router.push("/dashboard");
      } else {
        toast.success({
          title: "Sucess",
          description: "Account created Successfuly!",
        });
        router.push("/login");
      }
    } catch (err) {
      const fallbackMessage = "Something went wrong. Please try again.";
      setError(fallbackMessage);
      toast.error({
        title: "Authentication failed",
        description: fallbackMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={isLogin ? "Sign in" : "Create your account"}
      description={
        isLogin
          ? "Welcome back. Sign in to continue to Invoicify."
          : "Start tracking time and creating invoices in minutes."
      }
      footer={
        <p className="text-center text-sm text-txt-muted">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href="/register" className="font-medium text-txt-primary">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-txt-primary">
                Sign in
              </Link>
            </>
          )}
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait..."
            : isLogin
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
