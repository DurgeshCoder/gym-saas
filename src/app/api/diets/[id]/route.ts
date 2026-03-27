import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createDietPlanSchema } from "@/modules/diet/diet.schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const dietPlan = await prisma.dietPlan.findUnique({
            where: { id },
            include: { meals: { include: { foodItems: true } } }
        });

        if (!dietPlan) {
            return NextResponse.json({ message: "Diet plan not found" }, { status: 404 });
        }

        return NextResponse.json({ data: dietPlan });
    } catch (error: any) {
        console.error("Fetch diet plan error:", error);
        return NextResponse.json({ message: "Error fetching diet plan" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { role, gymId } = session.user as any;
        if (role !== "GYM_OWNER" && role !== "TRAINER") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const json = await req.json();
        const data = createDietPlanSchema.parse(json);

        const existing = await prisma.dietPlan.findUnique({ where: { id } });
        if (!existing || existing.gymId !== gymId) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Delete existing meals to recreate them cleanly
        await prisma.dietMeal.deleteMany({ where: { dietPlanId: id } });

        // Helper functions for correct calculation
        const calculateItemMacros = (item: any) => {
            const multiplier = item.unit === "g" || item.unit === "ml" 
                ? (item.quantity / 100) 
                : item.quantity;
            
            return {
                name: item.name,
                protein: item.protein * multiplier,
                carbs: item.carbs * multiplier,
                fats: item.fats * multiplier,
                calories: Math.round(item.calories * multiplier)
            };
        };

        const calculateMealCalories = (meal: any) => {
            return meal.foodItems.reduce((acc: number, item: any) => acc + calculateItemMacros(item).calories, 0);
        };

        const calculateDayCalories = (meals: any[]) => {
            return meals.reduce((acc: number, meal: any) => acc + calculateMealCalories(meal), 0);
        };

        let totalCals = 0;
        if (data.meals && data.meals.length > 0) {
            totalCals = Math.round(calculateDayCalories(data.meals));
        }

        const dietPlan = await prisma.dietPlan.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description || "",
                goal: data.goal,
                totalCalories: totalCals,
                meals: {
                    create: data.meals.map(meal => ({
                        mealType: meal.mealType,
                        time: meal.time,
                        foodItems: {
                            create: meal.foodItems.map(item => calculateItemMacros(item))
                        }
                    }))
                }
            },
            include: { meals: { include: { foodItems: true } } }
        });

        return NextResponse.json({ message: "Diet plan updated", data: dietPlan });
    } catch (error: any) {
        console.error("Update diet plan error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
