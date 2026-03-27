import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPlanSchema } from "@/modules/workout/workout.schema";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { role, gymId, id: creatorId } = session.user as any;

        // Allow Gym Owner and Trainer to create plans
        if (role !== "GYM_OWNER" && role !== "TRAINER") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (!gymId) {
            return NextResponse.json({ message: "No gym associated" }, { status: 400 });
        }

        const json = await req.json();
        const data = createPlanSchema.parse(json);

        const workoutPlan = await prisma.workoutPlan.create({
            data: {
                name: data.name,
                description: data.description,
                difficulty: data.difficulty,
                goal: data.goal,
                duration: data.duration,
                gymId,
                creatorId,
                days: {
                    create: data.days.map((day) => ({
                        dayNumber: day.dayNumber,
                        title: day.title,
                        notes: day.notes,
                        exercises: {
                            create: day.exercises.map(ex => ({
                                name: ex.name,
                                sets: ex.sets,
                                reps: ex.reps,
                                restTime: ex.restTime,
                                notes: ex.notes,
                                order: ex.order
                            }))
                        }
                    }))
                }
            },
            include: { days: { include: { exercises: true } } }
        });

        return NextResponse.json({ message: "Workout plan created", data: workoutPlan }, { status: 201 });
    } catch (error: any) {
        console.error("Create workout plan error:", error);
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

        const plans = await prisma.workoutPlan.findMany({
            where: { gymId },
            include: {
                creator: { select: { name: true } },
                _count: { select: { days: true, assignments: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ data: plans });
    } catch (error: any) {
        console.error("Fetch workout plans error:", error);
        return NextResponse.json({ message: "Error fetching workout plans" }, { status: 500 });
    }
}
