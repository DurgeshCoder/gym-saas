import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { role } = session.user as any;
        if (role !== "GYM_OWNER" && role !== "TRAINER") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        await prisma.memberWorkoutPlan.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Workout plan removed" });
    } catch (error: any) {
        console.error("Remove workout plan error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
