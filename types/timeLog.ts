import type { Client } from "./client";

export interface TimeLog {
  id: string;
  userId: string;
  clientId: string;
  client: Client;
  description: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number;
  status: string;
}

export interface TimeLogProps {
  id: string;
  description: string;
  endTime: Date | null;
  durationMinutes: number;
}
