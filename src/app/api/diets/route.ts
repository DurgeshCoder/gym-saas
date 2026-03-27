import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createDietPlanSchema } from "@/modules/diet/diet.schema";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { role, gymId, id: creatorId } = session.user as any;

        if (role !== "GYM_OWNER" && role !== "TRAINER") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (!gymId) {
            return NextResponse.json({ message: "No gym associated" }, { status: 400 });
        }

        const json = await req.json();
        const data = createDietPlanSchema.parse(json);

        // Auto calculate total calories from all meals
        let totalCals = 0;
        if (data.meals && data.meals.length > 0) {
            for (const meal of data.meals) {
                for (const item of meal.foodItems) {
                    totalCals += item.calories;
                }
            }
        }

        const dietPlan = await prisma.dietPlan.create({
            data: {
                name: data.name,
                description: data.description || "",
                goal: data.goal,
                totalCalories: totalCals,
                gymId,
                creatorId,
                meals: {
                    create: data.meals.map(meal => ({
                        mealType: meal.mealType,
                        time: meal.time,
                        foodItems: {
                            create: meal.foodItems.map(item => ({
                                name: item.name,
                                protein: item.protein,
                                carbs: item.carbs,
                                fats: item.fats,
                                calories: item.calories
                            }))
                        }
                    }))
                }
            },
            include: { meals: { include: { foodItems: true } } }
        });

        return NextResponse.json({ message: "Diet plan created", data: dietPlan }, { status: 201 });
    } catch (error: any) {
        console.error("Create diet plan error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { gymId } = session.user as any;
        if (!gymId) {
            return NextResponse.json({ data: [] });
        }

        const plans = await prisma.dietPlan.findMany({
            where: { gymId },
            include: {
                creator: { select: { name: true } },
                _count: { select: { meals: true, assignments: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ data: plans });
    } catch (error: any) {
        console.error("Fetch diet plans error:", error);
        return NextResponse.json({ message: "Error fetching diet plans" }, { status: 500 });
    }
}
