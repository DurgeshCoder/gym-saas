import { prisma } from "@/lib/prisma";

export async function getMemberDashboardData(userId: string) {
  const [subscription, workoutPlan, dietPlan] = await Promise.all([
    // Active Subscription
    prisma.subscription.findFirst({
      where: { userId, active: true },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Assigned Active Workout Plan
    prisma.memberWorkoutPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        workoutPlan: {
          include: {
            days: {
              include: {
                exercises: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { dayNumber: "asc" },
            },
            creator: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Assigned Active Diet Plan
    prisma.memberDietPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        dietPlan: {
          include: {
            meals: {
              include: {
                foodItems: true,
              },
            },
            creator: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    subscription,
    workoutPlan,
    dietPlan,
  };
}

export type MemberDashboardData = Awaited<ReturnType<typeof getMemberDashboardData>>;
