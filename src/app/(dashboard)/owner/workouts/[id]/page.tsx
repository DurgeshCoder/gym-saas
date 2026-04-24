import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PencilLine,
  Calendar,
  Dumbbell,
  Clock,
  Target,
  BarChart3,
  User2,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MediaPresenter,
  StatBadge,
  SectionHeader,
  difficultyConfig,
  goalConfig,
} from "../_components/workout-ui-shared";

export default async function ViewWorkoutPlanPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const gymId = (session.user as any).gymId;
  const { id } = await props.params;

  const plan = await prisma.workoutPlan.findUnique({
    where: { id, gymId },
    include: {
      creator: { select: { name: true } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!plan) return notFound();

  const totalExercises = plan.days.reduce(
    (acc, d) => acc + d.exercises.length,
    0
  );
  const difficulty = difficultyConfig[plan.difficulty] || {
    label: plan.difficulty,
    className: "",
  };
  const goal = goalConfig[plan.goal] || {
    label: plan.goal.replace("_", " "),
    className: "",
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <Link
            href="/owner/workouts"
            className="inline-flex shrink-0 items-center justify-center h-9 w-9 rounded-lg border border-border/70 bg-background shadow-sm hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
              {plan.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${difficulty.className}`}
              >
                <BarChart3 className="w-3 h-3" />
                {difficulty.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${goal.className}`}
              >
                <Target className="w-3 h-3" />
                {goal.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {plan.duration} Days
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/owner/workouts/${plan.id}/edit`}
          className="inline-flex shrink-0 items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors gap-2"
        >
          <PencilLine className="w-4 h-4" />
          Edit Plan
        </Link>
      </div>

      {/* ── Body Layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Plan Summary Sidebar ─────────────────────────────── */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Stats cards */}
          <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-border/50 bg-muted/20">
              <SectionHeader
                title="Plan Overview"
                description="Quick-glance stats"
              />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-muted/20 text-center">
                  <Calendar className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-lg font-bold text-foreground leading-none">
                    {plan.days.length}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Training Days
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-muted/20 text-center">
                  <Dumbbell className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-lg font-bold text-foreground leading-none">
                    {totalExercises}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Exercises
                  </span>
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-muted/20 text-center">
                  <Clock className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-lg font-bold text-foreground leading-none">
                    {plan.duration}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Day Cycle
                  </span>
                </div>
              </div>

              <Separator className="!my-3" />

              {/* Author */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {plan.creator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="text-sm font-semibold text-foreground">
                    {plan.creator.name}
                  </p>
                </div>
              </div>

              {/* Description */}
              {plan.description && (
                <>
                  <Separator className="!my-3" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">
                      Description
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Day-by-day breakdown ──────────────────────────────── */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          <SectionHeader
            icon={<Calendar className="w-4 h-4" />}
            title="Workout Schedule"
            description={`${plan.days.length} training ${plan.days.length === 1 ? "day" : "days"} in this program`}
          />

          <div className="space-y-4">
            {plan.days.map((day) => (
              <DayViewCard key={day.id} day={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Day View Card ─────────────────────────────────────────────────────────────
function DayViewCard({ day }: { day: any }) {
  return (
    <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
      {/* Day header */}
      <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
              {day.dayNumber}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {day.title || `Day ${day.dayNumber}`}
              </h3>
              {day.notes && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {day.notes}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-background border border-border/60 rounded-md px-2.5 py-1 shrink-0">
            {day.exercises.length}{" "}
            {day.exercises.length === 1 ? "exercise" : "exercises"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {day.exercises.length > 0 ? (
          <div className="divide-y divide-border/50">
            {day.exercises.map((ex: any, idx: number) => (
              <ExerciseViewRow key={ex.id} ex={ex} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Dumbbell className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No exercises configured
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Exercise View Row ─────────────────────────────────────────────────────────
function ExerciseViewRow({ ex, idx }: { ex: any; idx: number }) {
  return (
    <div className="p-5 hover:bg-muted/20 transition-colors group">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Media (left on desktop) */}
        {ex.videoUrl && (
          <div className="w-full md:w-44 lg:w-52 shrink-0">
            <MediaPresenter
              videoUrl={ex.videoUrl}
              videoType={ex.videoType || "YOUTUBE"}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 w-6 h-6 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              <h4 className="text-sm font-semibold text-foreground truncate">
                {ex.name}
              </h4>
            </div>

            {/* Stat badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <StatBadge label="Sets" value={ex.sets} />
              <StatBadge label="Reps" value={ex.reps} />
              <StatBadge label="Rest" value={`${ex.restTime}s`} />
            </div>
          </div>

          {/* Notes */}
          {ex.notes && (
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 mt-2">
              {ex.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
