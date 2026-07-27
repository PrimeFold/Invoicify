import { Invoice } from "./invoice";
import { TimeLog } from "./timeLog";
import { User } from "./user";

export interface Client {
  id?: string;
  userId?: string;
  user?: User;
  name: string;
  email: string;
  hourlyRate: number | string;
  timeLogs?: TimeLog[];
  invoices?: Invoice[];
}