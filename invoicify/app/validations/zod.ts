import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(4).max(30),
  email: z.email(),
  hourlyRate: z.union([z.string(), z.number()]).transform((value) => Number(value)),
});

