import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createGymSchema } from "@/lib/schemas/gym";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "GYM_OWNER") {
      // For now, if someone is trying to create a gym, maybe they need to be a GYM_OWNER, 
      // or we promote them upon Gym creation. Let's assume you must be logged in.
      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const result = createGymSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { name } = result.data;
    const userId = (session.user as any).id;

    // Check if user already owns a gym (optional business logic)
    const existingGym = await prisma.gym.findUnique({
      where: { ownerId: userId },
    });

    if (existingGym) {
      return NextResponse.json({ message: "You already own a gym" }, { status: 400 });
    }

    // Create the gym and assign the user as owner
    const gym = await prisma.$transaction(async (tx) => {
      const newGym = await tx.gym.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      // Update the user's role to GYM_OWNER and link to the gym if they weren't already
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: "GYM_OWNER", 
          gymId: newGym.id 
        },
      });

      return newGym;
    });

    return NextResponse.json({ message: "Gym created successfully", gym }, { status: 201 });
  } catch (error: any) {
    console.error("Create Gym error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
