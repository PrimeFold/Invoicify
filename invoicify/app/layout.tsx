import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoicify | Time tracking and invoicing",
  description: "Track billable work and create polished invoices with Invoicify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full font-sans antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
