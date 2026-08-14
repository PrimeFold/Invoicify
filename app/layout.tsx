import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invoicify | Time tracking and invoicing",
  description:
    "Track billable work and create polished invoices with Invoicify.",
  icons: {
    icon: "/invoicify-purple-logo-set/invoicify-favicon.svg",
    shortcut: "/invoicify-purple-logo-set/invoicify-app-icon.svg",
    apple: "/invoicify-purple-logo-set/invoicify-app-icon.svg",
  },
};

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full font-sans antialiased dark ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-canvas text-txt-primary font-sans antialiased min-h-screen flex flex-col transition-colors duration-200">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
