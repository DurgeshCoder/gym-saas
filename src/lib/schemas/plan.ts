import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(2, "Plan name must be at least 2 characters"),
  price: z.number().positive("Price must be greater than 0"),
  duration: z.number().int().positive("Duration must be a positive number of days"),
});

export type PlanInput = z.infer<typeof planSchema>;
