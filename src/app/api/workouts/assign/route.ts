import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignPlanSchema } from "@/modules/workout/workout.schema";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { role, gymId } = session.user as any;
        if (role !== "GYM_OWNER" && role !== "TRAINER") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const json = await req.json();
        const data = assignPlanSchema.parse(json);

        // Verify member belongs to same gym
        const member = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!member || member.gymId !== gymId) {
            return NextResponse.json({ message: "Member not found in your gym" }, { status: 404 });
        }

        // Cancel previously active plans for this member to maintain one active at a time
        await prisma.memberWorkoutPlan.updateMany({
            where: { userId: data.userId, status: "ACTIVE" },
            data: { status: "CANCELLED" }
        });

        const assignment = await prisma.memberWorkoutPlan.create({
            data: {
                userId: data.userId,
                workoutPlanId: data.workoutPlanId,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: "ACTIVE"
            }
        });

        return NextResponse.json({ message: "Workout plan assigned", data: assignment }, { status: 201 });
    } catch (error: any) {
        console.error("Assign workout plan error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
