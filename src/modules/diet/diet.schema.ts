import { z } from "zod";

export const createDietPlanSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    goal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE"]),
    totalCalories: z.number().int().min(0).optional(), // Can calculate dynamically later
    meals: z.array(z.object({
        mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
        time: z.string().optional(),
        foodItems: z.array(z.object({
            name: z.string().min(1, "Food name is required"),
            protein: z.number().min(0),
            carbs: z.number().min(0),
            fats: z.number().min(0),
            calories: z.number().min(0)
        }))
    }))
});

export const assignDietPlanSchema = z.object({
    userId: z.string().min(1, "User is required"),
    dietPlanId: z.string().min(1, "Diet plan is required"),
    startDate: z.string()
});
