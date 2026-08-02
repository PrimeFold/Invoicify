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
      className="h-full font-sans antialiased dark"
    >
      <body className="bg-canvas text-txt-primary font-sans antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
