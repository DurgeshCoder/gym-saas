"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell,
  User2,
  Clock,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Bed,
  StickyNote,
  Calendar,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Info,
  Flame,
  Zap,
} from "lucide-react";
import { MemberDashboardData, MemberWorkoutPlansData } from "@/lib/queries/member";
import { cn } from "@/lib/utils";

// ─── Type aliases ─────────────────────────────────────────────────────────────
type WorkoutPlanData = NonNullable<MemberDashboardData>["workoutPlan"];
type SinglePlan = MemberWorkoutPlansData[number];

// ─── YouTube embed helper ─────────────────────────────────────────────────────
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0`;
  }
  return null;
}

// ─── Media preview ────────────────────────────────────────────────────────────
function ExerciseMedia({
  videoUrl,
  videoType,
}: {
  videoUrl: string | null;
  videoType: string | null;
}) {
  if (!videoUrl) return null;

  const isYoutube =
    videoType === "YOUTUBE" ||
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be");

  const wrapperCls =
    "mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border shadow-sm";

  if (isYoutube) {
    const embedUrl = getYoutubeEmbedUrl(videoUrl);
    if (!embedUrl) {
      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-2"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Watch on YouTube
        </a>
      );
    }
    return (
      <div className={`${wrapperCls} bg-black`}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  const isVideo = videoUrl.match(/\.(mp4|webm)$/i);
  if (isVideo) {
    return (
      <div className={`${wrapperCls} bg-black`}>
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`${wrapperCls} bg-muted/20`}>
      <img
        src={videoUrl}
        alt="Exercise demo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border text-center min-w-[72px]",
        accent
          ? "bg-primary/8 border-primary/20 text-primary"
          : "bg-muted/40 border-border/60"
      )}
    >
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider leading-none mb-1",
          accent ? "text-primary/70" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-base font-bold leading-none",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Difficulty / status style maps ──────────────────────────────────────────
const difficultyStyle: Record<string, string> = {
  BEGINNER:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  INTERMEDIATE:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  ADVANCED:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
};

function statusConfig(status: string): {
  label: string;
  icon: React.ReactNode;
  className: string;
} {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        icon: <CheckCircle2 className="w-3 h-3" />,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        icon: <XCircle className="w-3 h-3" />,
        className:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        icon: <CheckCircle2 className="w-3 h-3" />,
        className:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      };
    default:
      return {
        label: status,
        icon: <AlertTriangle className="w-3 h-3" />,
        className: "bg-muted text-muted-foreground border-border",
      };
  }
}

// ─── Expandable exercise row ──────────────────────────────────────────────────
function ExerciseRow({ exercise, idx }: { exercise: any; idx: number }) {
  const [open, setOpen] = useState(false);
  const hasMedia = !!exercise.videoUrl;
  const hasNotes = !!exercise.notes;
  const hasDetails = hasMedia || hasNotes;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        open
          ? "border-primary/30 bg-primary/[0.03] shadow-sm"
          : "border-border/60 bg-card hover:border-border hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left",
          hasDetails ? "cursor-pointer" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
              open
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground border border-border/50"
            )}
          >
            {idx + 1}
          </span>
          <span className="font-semibold text-sm text-foreground truncate">
            {exercise.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs font-medium bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 text-foreground">
              {exercise.sets} × {exercise.reps}
            </span>
            <span className="text-xs font-medium bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 text-muted-foreground">
              {exercise.restTime}s rest
            </span>
          </div>
          {hasDetails && (
            <div
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                open ? "text-primary" : "text-muted-foreground"
              )}
            >
              {open ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </button>

      {/* Mobile stats */}
      <div className="sm:hidden flex items-center gap-2 px-4 pb-3 -mt-1">
        <span className="text-xs font-medium bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 text-foreground">
          {exercise.sets} × {exercise.reps}
        </span>
        <span className="text-xs font-medium bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 text-muted-foreground">
          {exercise.restTime}s rest
        </span>
      </div>

      {/* Expanded details */}
      {open && hasDetails && (
        <div className="px-4 pb-4 pt-0 border-t border-border/40 space-y-3">
          <div className="flex flex-wrap gap-2 pt-3">
            <StatPill label="Sets" value={exercise.sets} />
            <StatPill label="Reps" value={exercise.reps} />
            <StatPill label="Rest" value={`${exercise.restTime}s`} />
          </div>

          {hasNotes && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                  Trainer Note
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {exercise.notes}
                </p>
              </div>
            </div>
          )}

          {hasMedia && (
            <ExerciseMedia
              videoUrl={exercise.videoUrl}
              videoType={exercise.videoType}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Active plan full view ────────────────────────────────────────────────────
function ActivePlanCard({ plan }: { plan: SinglePlan }) {
  const { workoutPlan, status } = plan;
  const days = workoutPlan.days ?? [];
  const totalExercises = days.reduce(
    (acc: number, d: any) => acc + (d.exercises?.length ?? 0),
    0
  );
  const diffClass = difficultyStyle[workoutPlan.difficulty] ?? "";
  const sc = statusConfig(status);

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <div className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {workoutPlan.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5" />
                    By {workoutPlan.creator.name}
                  </span>
                  {plan.startDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Started{" "}
                      {new Date(plan.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border",
                  diffClass
                )}
              >
                <BarChart3 className="w-3 h-3" />
                {workoutPlan.difficulty.charAt(0) +
                  workoutPlan.difficulty.slice(1).toLowerCase()}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border",
                  sc.className
                )}
              >
                {sc.icon}
                {sc.label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <StatPill label="Duration" value={`${workoutPlan.duration} Days`} accent />
            <StatPill label="Days" value={days.length} />
            <StatPill label="Exercises" value={totalExercises} />
            {workoutPlan.goal && (
              <StatPill
                label="Goal"
                value={workoutPlan.goal.replace(/_/g, " ")}
              />
            )}
          </div>

          {workoutPlan.description && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
              {workoutPlan.description}
            </p>
          )}
        </div>
      </div>

      {/* Day tabs */}
      {days.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Daily Schedule
              </h3>
              <p className="text-xs text-muted-foreground">
                {days.length} training {days.length === 1 ? "day" : "days"} ·
                tap exercises for details
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <Tabs defaultValue={days[0]?.id} className="w-full">
              <TabsList className="inline-flex h-auto bg-muted/40 p-1 rounded-xl border border-border/50 gap-1 w-full justify-start overflow-x-auto scrollbar-none mb-5 flex-nowrap">
                {days.map((day: any) => (
                  <TabsTrigger
                    key={day.id}
                    value={day.id}
                    className="relative shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Day </span>
                    {day.dayNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              {days.map((day: any) => (
                <TabsContent
                  key={day.id}
                  value={day.id}
                  className="focus-visible:outline-none animate-in fade-in-50 duration-200"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-base font-semibold text-foreground">
                        {day.title || `Day ${day.dayNumber}`}
                      </h4>
                      <span className="text-xs font-medium text-muted-foreground bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 shrink-0">
                        {day.exercises?.length ?? 0}{" "}
                        {day.exercises?.length === 1 ? "exercise" : "exercises"}
                      </span>
                    </div>
                    {day.notes && (
                      <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                        <StickyNote className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {day.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {day.exercises && day.exercises.length > 0 ? (
                    <div className="space-y-2.5">
                      {day.exercises.map((ex: any, idx: number) => (
                        <ExerciseRow key={ex.id} exercise={ex} idx={idx} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border/50 bg-muted/10 text-center">
                      <Bed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Rest Day
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recovery is part of progress. Take it easy today.
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 text-center">
          <Dumbbell className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No daily schedule defined in this plan.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Inactive / history plan row ──────────────────────────────────────────────
function InactivePlanRow({ plan }: { plan: SinglePlan }) {
  const { workoutPlan, status } = plan;
  const sc = statusConfig(status);
  const diffClass = difficultyStyle[workoutPlan.difficulty] ?? "";

  return (
    <div className="relative flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/10 transition-colors group overflow-hidden">
      {/* Locked overlay hint */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/80 backdrop-blur-sm border border-border/50 rounded-md px-2.5 py-1">
            <Lock className="w-3 h-3" />
            Contact your gym to reactivate
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        {/* Faded icon */}
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
          <Dumbbell className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {workoutPlan.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {workoutPlan.duration} days
            </span>
            <span className="text-xs text-muted-foreground opacity-50">·</span>
            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                diffClass
              )}
            >
              {workoutPlan.difficulty.charAt(0) +
                workoutPlan.difficulty.slice(1).toLowerCase()}
            </span>
            {plan.startDate && (
              <>
                <span className="text-xs text-muted-foreground opacity-50">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(plan.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status + Lock indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border",
            sc.className
          )}
        >
          {sc.icon}
          {sc.label}
        </span>
        <div className="w-6 h-6 rounded-full bg-muted border border-border/50 flex items-center justify-center">
          <Lock className="w-3 h-3 text-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}

// ─── No plan empty state ──────────────────────────────────────────────────────
function NoPlanState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm">
        <Dumbbell className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No Workout Plan Assigned
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your trainer hasn&apos;t assigned a workout plan yet. Check back later
        or speak to your gym staff.
      </p>
    </div>
  );
}

// ─── Today's workout helper (pure, no hooks) ─────────────────────────────────
function computeTodayDay(plan: SinglePlan): any | null {
  const days = plan.workoutPlan.days ?? [];
  if (!days.length || !plan.startDate) return null;
  const start = new Date(plan.startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const idx = Math.max(0, elapsed) % days.length;
  return days[idx] ?? null;
}

// ─── Today's Workout Banner ───────────────────────────────────────────────────
function TodaysWorkoutBanner({ todayDay }: { todayDay: any }) {
  if (!todayDay) return null;
  const isRestDay = !todayDay.exercises || todayDay.exercises.length === 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden shadow-sm",
      isRestDay
        ? "border-border/60 bg-muted/20"
        : "border-primary/20 bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-3 px-5 py-4 border-b",
        isRestDay ? "border-border/50 bg-muted/30" : "border-primary/15 bg-primary/[0.06]"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            isRestDay ? "bg-muted border border-border/50" : "bg-primary/15 border border-primary/20"
          )}>
            {isRestDay
              ? <Bed className="w-5 h-5 text-muted-foreground" />
              : <Flame className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isRestDay ? "text-muted-foreground" : "text-primary"
              )}>
                Today&apos;s Workout
              </span>
              <span className="text-[10px] font-medium bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground">
                Day {todayDay.dayNumber}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {isRestDay ? "Rest & Recovery Day" : (todayDay.title || `Day ${todayDay.dayNumber}`)}
            </p>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:block shrink-0">{today}</span>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {isRestDay ? (
          <div className="flex items-start gap-3">
            <div className="text-3xl">🛌</div>
            <div>
              <p className="font-medium text-foreground">Take it easy today.</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rest is where growth happens. Hydrate, stretch, and recover.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayDay.notes && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">{todayDay.notes}</p>
              </div>
            )}
            <div className="space-y-2">
              {todayDay.exercises.map((ex: any, idx: number) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 border border-primary/20">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1 truncate">{ex.name}</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">{ex.sets} × {ex.reps}</span>
                  <span className="text-[11px] text-muted-foreground/70 shrink-0">{ex.restTime}s</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{todayDay.exercises.length}</span>{" "}
                {todayDay.exercises.length === 1 ? "exercise" : "exercises"} today
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Zap className="w-3.5 h-3.5" /> Stay focused!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Full-page workout plan view (for /member/workout-plan route) ─────────────
export function WorkoutPlanView({
  activePlan,
  historyPlans,
}: {
  activePlan: SinglePlan | null;
  historyPlans: SinglePlan[];
}) {
  const todayDay = activePlan ? computeTodayDay(activePlan) : null;

  return (
    <div className="space-y-8">
      {/* ── Today's Workout Banner ─────────────────────────────────────── */}
      {activePlan && todayDay && (
        <section>
          <TodaysWorkoutBanner todayDay={todayDay} />
        </section>
      )}

      {/* Active plan section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Current Plan
          </h2>
        </div>

        {activePlan ? (
          <ActivePlanCard plan={activePlan} />
        ) : (
          <NoPlanState />
        )}
      </section>

      {/* Inactive / history section */}
      {historyPlans.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Plan History
            </h2>
            <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              {historyPlans.length}
            </span>
          </div>

          {/* Info callout — member cannot renew inactive plans */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/50 mb-4">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                Inactive plans are read-only.
              </span>{" "}
              Only your gym owner or trainer can reactivate a plan. Contact your
              gym staff if you'd like to resume a previous routine.
            </p>
          </div>

          <div className="space-y-2.5">
            {historyPlans.map((plan) => (
              <InactivePlanRow key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Dashboard summary card export (for /member/dashboard shortcut) ───────────
interface WorkoutPlanCardProps {
  memberWorkoutPlan: WorkoutPlanData;
}

export function WorkoutPlanCard({ memberWorkoutPlan }: WorkoutPlanCardProps) {
  if (!memberWorkoutPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm">
          <Dumbbell className="w-8 h-8 text-muted-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Workout Plan Assigned
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your trainer hasn&apos;t assigned a workout plan yet. Check back later
          or speak to your gym staff.
        </p>
      </div>
    );
  }

  // Full active-plan view (used when workout-plan page loads from old dashboard route)
  const days = memberWorkoutPlan.workoutPlan.days ?? [];
  const totalExercises = days.reduce(
    (acc: number, d: any) => acc + (d.exercises?.length ?? 0),
    0
  );
  const { workoutPlan, status } = memberWorkoutPlan;
  const diffClass = difficultyStyle[workoutPlan.difficulty] ?? "";
  const sc = statusConfig(status);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <div className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {workoutPlan.name}
                </h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <User2 className="w-3.5 h-3.5" />
                  By {workoutPlan.creator.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border", diffClass)}>
                <BarChart3 className="w-3 h-3" />
                {workoutPlan.difficulty.charAt(0) + workoutPlan.difficulty.slice(1).toLowerCase()}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border", sc.className)}>
                {sc.icon}
                {sc.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill label="Duration" value={`${workoutPlan.duration} Days`} accent />
            <StatPill label="Days" value={days.length} />
            <StatPill label="Exercises" value={totalExercises} />
            {workoutPlan.goal && <StatPill label="Goal" value={workoutPlan.goal.replace(/_/g, " ")} />}
          </div>

          {workoutPlan.description && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
              {workoutPlan.description}
            </p>
          )}
        </div>
      </div>

      {days.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Daily Schedule</h3>
              <p className="text-xs text-muted-foreground">{days.length} training {days.length === 1 ? "day" : "days"} · tap exercises for details</p>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <Tabs defaultValue={days[0]?.id} className="w-full">
              <TabsList className="inline-flex h-auto bg-muted/40 p-1 rounded-xl border border-border/50 gap-1 w-full justify-start overflow-x-auto scrollbar-none mb-5 flex-nowrap">
                {days.map((day: any) => (
                  <TabsTrigger key={day.id} value={day.id} className="relative shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                    <span className="hidden sm:inline">Day </span>{day.dayNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
              {days.map((day: any) => (
                <TabsContent key={day.id} value={day.id} className="focus-visible:outline-none animate-in fade-in-50 duration-200">
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-base font-semibold text-foreground">{day.title || `Day ${day.dayNumber}`}</h4>
                      <span className="text-xs font-medium text-muted-foreground bg-muted/60 border border-border/50 rounded-md px-2.5 py-1 shrink-0">{day.exercises?.length ?? 0} {day.exercises?.length === 1 ? "exercise" : "exercises"}</span>
                    </div>
                    {day.notes && (
                      <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                        <StickyNote className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{day.notes}</p>
                      </div>
                    )}
                  </div>
                  {day.exercises && day.exercises.length > 0 ? (
                    <div className="space-y-2.5">
                      {day.exercises.map((ex: any, idx: number) => (
                        <ExerciseRow key={ex.id} exercise={ex} idx={idx} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border/50 bg-muted/10 text-center">
                      <Bed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">Rest Day</p>
                      <p className="text-xs text-muted-foreground">Recovery is part of progress.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
