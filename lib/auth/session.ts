import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function getSessionFromHeaders(
  headersValue: Headers | NextRequest["headers"]
) {
  return auth.api.getSession({ headers: headersValue });
}

export async function getCurrentSession() {
  const requestHeaders = await headers();
  return getSessionFromHeaders(new Headers(requestHeaders));
}

export async function requireUser() {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
