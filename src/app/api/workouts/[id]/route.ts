import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPlanSchema } from "@/modules/workout/workout.schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const workoutPlan = await prisma.workoutPlan.findUnique({
            where: { id },
            include: { days: { include: { exercises: true } } }
        });

        if (!workoutPlan) {
            return NextResponse.json({ message: "Workout plan not found" }, { status: 404 });
        }

        return NextResponse.json({ data: workoutPlan });
    } catch (error: any) {
        console.error("Fetch workout plan error:", error);
        return NextResponse.json({ message: "Error fetching workout plan" }, { status: 500 });
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
        const data = createPlanSchema.parse(json);

        const existing = await prisma.workoutPlan.findUnique({ where: { id } });
        if (!existing || existing.gymId !== gymId) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        await prisma.workoutDay.deleteMany({ where: { workoutPlanId: id } });

        const workoutPlan = await prisma.workoutPlan.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                difficulty: data.difficulty,
                goal: data.goal,
                duration: data.duration,
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

        return NextResponse.json({ message: "Workout plan updated", data: workoutPlan });
    } catch (error: any) {
        console.error("Update workout plan error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
