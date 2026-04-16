import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/schemas/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, gymName, requirements } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Default to GYM_OWNER for public registration
    const userRole = "GYM_OWNER";

    // Create user and gym in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: userRole,
          ownedGym: {
            create: {
              name: gymName,
              description: requirements,
            }
          }
        },
        include: {
          ownedGym: true
        }
      });
      
      if (newUser.ownedGym) {
        await tx.user.update({
          where: { id: newUser.id },
          data: { gymId: newUser.ownedGym.id }
        });
      }
      
      return newUser;
    });

    // We do NOT return the password hash
    return NextResponse.json(
      { 
        message: "Gym Owner registered successfully", 
        user: { id: user.id, email: user.email, name: user.name, role: user.role } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
