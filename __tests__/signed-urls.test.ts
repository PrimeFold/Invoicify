import { describe, expect, it } from "vitest";
import {
  generateInvoiceShareToken,
  verifyInvoiceShareToken,
} from "@/lib/signed-urls";

describe("24-Hour Signed URL Generator & Verification", () => {
  it("should generate a valid share token with invoiceId, expiresAt, and shareUrl", async () => {
    const invoiceId = "inv_test_12345";
    const result = await generateInvoiceShareToken(invoiceId, 24);

    expect(result).toBeDefined();
    expect(result.token).toContain(invoiceId);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
    expect(result.shareUrl).toContain(`/preview/invoice/${invoiceId}`);
    expect(result.shareUrl).toContain(`expires=${result.expiresAt}`);
  });

  it("should verify a valid signed token successfully", async () => {
    const invoiceId = "inv_test_67890";
    const { token, expiresAt } = await generateInvoiceShareToken(invoiceId, 24);

    const verification = await verifyInvoiceShareToken(invoiceId, token, expiresAt);

    expect(verification.valid).toBe(true);
    expect(verification.error).toBeUndefined();
  });

  it("should reject an expired token", async () => {
    const invoiceId = "inv_expired_999";
    const pastExpiresAt = Date.now() - 10000; // 10 seconds ago
    const fakeToken = `${invoiceId}.${pastExpiresAt}.fakesig`;

    const verification = await verifyInvoiceShareToken(invoiceId, fakeToken, pastExpiresAt);

    expect(verification.valid).toBe(false);
    expect(verification.error).toContain("expired");
  });

  it("should reject a tampered signature", async () => {
    const invoiceId = "inv_test_tampered";
    const { expiresAt } = await generateInvoiceShareToken(invoiceId, 24);
    const tamperedToken = `${invoiceId}.${expiresAt}.invalid_signature_hex`;

    const verification = await verifyInvoiceShareToken(invoiceId, tamperedToken, expiresAt);

    expect(verification.valid).toBe(false);
    expect(verification.error).toContain("Invalid or tampered");
  });
});
