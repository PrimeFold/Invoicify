import type { LucideIcon } from "lucide-react";
import { Clock3, FileText, WalletCards } from "lucide-react";

export type FeatureCardData = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

export const featureCards: FeatureCardData[] = [
  {
    icon: Clock3,
    title: "Track Billable Time",
    description:
      "Log hours with an active stopwatch or precise manual entries. Zero flow-state interruptions.",
    tag: "TIMELOGS",
  },
  {
    icon: FileText,
    title: "Server-Side Vector PDFs",
    description:
      "Compile unbilled hours into crisp, itemized PDFs streamed directly via Node.js PDFKit.",
    tag: "PDF ENGINE",
  },
  {
    icon: WalletCards,
    title: "Financial Ledger Analytics",
    description:
      "Instant real-time breakdown of unbilled revenue, pending invoices, and monthly cash flow.",
    tag: "ANALYTICS",
  },
];
