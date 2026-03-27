import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignDietPlanSchema } from "@/modules/diet/diet.schema";

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
        const data = assignDietPlanSchema.parse(json);

        const member = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!member || member.gymId !== gymId) {
            return NextResponse.json({ message: "Member not found in your gym" }, { status: 404 });
        }

        await prisma.memberDietPlan.updateMany({
            where: { userId: data.userId, status: "ACTIVE" },
            data: { status: "CANCELLED" }
        });

        const assignment = await prisma.memberDietPlan.create({
            data: {
                userId: data.userId,
                dietPlanId: data.dietPlanId,
                startDate: new Date(data.startDate),
                status: "ACTIVE"
            }
        });

        return NextResponse.json({ message: "Diet plan assigned", data: assignment }, { status: 201 });
    } catch (error: any) {
        console.error("Assign diet plan error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
