import type { LucideIcon } from "lucide-react";
import { Clock3, FileText, Link2, BarChart3, Shield, Zap } from "lucide-react";

export type FeatureCardData = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

export const featureCards: FeatureCardData[] = [
  {
    icon: Clock3,
    title: "Time Tracking",
    description:
      "Start a timer, pick a client, describe the work. Hours are logged automatically with zero interruptions to your flow.",
    tag: "CORE",
  },
  {
    icon: FileText,
    title: "PDF Invoices",
    description:
      "Select unbilled hours, click generate. A professional PDF invoice is compiled server-side and ready to share in seconds.",
    tag: "BILLING",
  },
  {
    icon: Link2,
    title: "Secure Sharing",
    description:
      "Share invoices via 24-hour signed links. Clients view and download without creating an account. Links auto-expire.",
    tag: "DELIVERY",
  },
  {
    icon: BarChart3,
    title: "Revenue Dashboard",
    description:
      "12-month trajectory of collected revenue and billable hours. See unbilled accrual across every client at a glance.",
    tag: "ANALYTICS",
  },
  {
    icon: Shield,
    title: "Session Auth",
    description:
      "Email and password authentication with session tokens. Your data is isolated per-account with cascading access controls.",
    tag: "SECURITY",
  },
  {
    icon: Zap,
    title: "Optimistic UI",
    description:
      "Deletions, status changes, and transitions update in 0ms using React 19 optimistic hooks. The server catches up in the background.",
    tag: "PERFORMANCE",
  },
];
