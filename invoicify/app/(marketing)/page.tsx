import { requireUser } from "@/lib/auth/session";
import { LandingPage } from "./landing/landing-page";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await requireUser();
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
