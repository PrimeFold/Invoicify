"use server";

import crypto from "crypto";

const SECRET_KEY =
  process.env.BETTER_AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "invoicify-secret-key-change-in-production";

export interface ShareTokenData {
  token: string;
  expiresAt: number;
  shareUrl: string;
}

export const generateInvoiceShareToken = async (
  invoiceId: string,
  expiresInHours = 24
): Promise<ShareTokenData> => {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = `${invoiceId}:${expiresAt}`;

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");
  const token = `${invoiceId}.${expiresAt}.${signature}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/preview/invoice/${invoiceId}?token=${encodeURIComponent(token)}&expires=${expiresAt}`;

  return {
    token,
    expiresAt,
    shareUrl,
  };
};

export const verifyInvoiceShareToken = async (
  invoiceId: string,
  token: string,
  expiresAtInput: number | string
): Promise<{ valid: boolean; error?: string }> => {
  const expiresAt = typeof expiresAtInput === "string" ? Number(expiresAtInput) : expiresAtInput;

  if (!expiresAt || Date.now() > expiresAt) {
    return { valid: false, error: "This preview link expired after 24 hours." };
  }

  const payload = `${invoiceId}:${expiresAt}`;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  const expectedToken = `${invoiceId}.${expiresAt}.${expectedSignature}`;

  if (token !== expectedToken) {
    return {
      valid: false,
      error: "Invalid or tampered signature.",
    };
  }

  return {
    valid: true,
  };
};
