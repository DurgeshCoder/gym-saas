import { z } from "zod";

export const createGymSchema = z.object({
  name: z.string().min(3, "Gym name must be at least 3 characters"),
});

export type CreateGymInput = z.infer<typeof createGymSchema>;

export const gymSettingsSchema = z.object({
  name: z.string().min(3, "Gym name must be at least 3 characters"),
  logo: z.string().optional(),
  address: z.string().optional(),
});

export type GymSettingsInput = z.infer<typeof gymSettingsSchema>;
