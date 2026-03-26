import { z } from "zod";

export const createPlanSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    goal: z.enum(["FAT_LOSS", "MUSCLE_GAIN", "STRENGTH", "GENERAL_FITNESS"]),
    duration: z.number().int().min(1, "Duration must be at least 1 day"),
    days: z.array(z.object({
        dayNumber: z.number().int(),
        title: z.string().optional(),
        exercises: z.array(z.object({
            name: z.string(),
            sets: z.number().int().min(1),
            reps: z.string(),
            restTime: z.number().int(),
            order: z.number().int(),
        }))
    }))
});

export const assignPlanSchema = z.object({
    userId: z.string(),
    workoutPlanId: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
});
