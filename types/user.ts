import type { Client } from "./client";
import type { Invoice } from "./invoice";
import type { TimeLog } from "./timeLog";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  invoices: Invoice[];
  clients: Client[];
  timeLog: TimeLog[];
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
