"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlanSchema } from "@/modules/workout/workout.schema";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Dumbbell,
  Calendar,
  Loader2,
  Upload,
  Layers,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MediaPresenter, SectionHeader } from "../_components/workout-ui-shared";

type FormValues = z.infer<typeof createPlanSchema>;

export default function CreateWorkoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      description: "",
      difficulty: "BEGINNER",
      goal: "GENERAL_FITNESS",
      duration: 7,
      days: [
        {
          dayNumber: 1,
          title: "Workout Day 1",
          notes: "",
          exercises: [
            {
              name: "",
              sets: 3,
              reps: "10-12",
              restTime: 60,
              notes: "",
              videoUrl: "",
              videoType: "YOUTUBE",
              order: 1,
            },
          ],
        },
      ],
    },
  });

  const { control, handleSubmit } = form;

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({ control, name: "days" });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      data.days.forEach((day, dIdx) => {
        day.dayNumber = dIdx + 1;
        day.exercises.forEach((ex, eIdx) => (ex.order = eIdx + 1));
      });

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Workout plan created successfully!");
        router.push("/owner/workouts");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create plan");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: any) => {
    console.error("Form validation errors:", formErrors);
    toast.error("Please fill in all required fields correctly.");
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/workouts"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-9 w-9 rounded-lg border-border/70 shadow-sm shrink-0"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
              Create Workout Plan
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build a structured training protocol for your members.
            </p>
          </div>
        </div>

        {/* Desktop save button */}
        <Button
          onClick={handleSubmit(onSubmit, onError)}
          disabled={isSubmitting}
          size="sm"
          className="hidden sm:inline-flex h-9 px-5 font-medium shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSubmitting ? "Saving..." : "Save Plan"}
        </Button>
      </div>

      <Form {...form}>
        <form>
          <Tabs defaultValue="foundation" className="w-full">
            {/* ── Tabs Nav ─────────────────────────────────────────────── */}
            <TabsList className="inline-flex h-auto bg-transparent p-0 mb-7 border-b border-border/60 w-full justify-start gap-0 rounded-none overflow-x-auto scrollbar-none">
              <TabsTrigger
                value="foundation"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground transition-colors whitespace-nowrap"
              >
                <Layers className="w-4 h-4 mr-2 inline-block opacity-70" />
                Plan Details
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 mr-2 inline-block opacity-70" />
                Daily Routine
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Plan Details ────────────────────────────────── */}
            <TabsContent
              value="foundation"
              className="animate-in fade-in-50 duration-300"
            >
              <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-border/50 bg-muted/20">
                  <SectionHeader
                    icon={<ClipboardList className="w-4 h-4" />}
                    title="Core Plan Details"
                    description="High-level settings that define this workout program."
                  />
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Plan Name */}
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Plan Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 12-Week Hypertrophy Protocol"
                            className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Description{" "}
                          <span className="text-muted-foreground font-normal">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Provide a summary of what this plan aims to achieve..."
                            className="resize-none text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Difficulty + Goal + Duration grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <FormField
                      control={control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Difficulty Level
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="BEGINNER">Beginner</SelectItem>
                              <SelectItem value="INTERMEDIATE">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Primary Goal
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm">
                                <SelectValue placeholder="Select goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="FAT_LOSS">Fat Loss</SelectItem>
                              <SelectItem value="MUSCLE_GAIN">
                                Muscle Gain
                              </SelectItem>
                              <SelectItem value="STRENGTH">Strength</SelectItem>
                              <SelectItem value="GENERAL_FITNESS">
                                General Fitness
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Duration (Days)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              min={1}
                              className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab 2: Daily Routine ───────────────────────────────── */}
            <TabsContent
              value="schedule"
              className="animate-in fade-in-50 duration-300"
            >
              <div className="space-y-1 mb-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
                <SectionHeader
                  icon={<Calendar className="w-4 h-4" />}
                  title="Daily Routine"
                  description="Configure exercises for each training day."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendDay({
                      dayNumber: dayFields.length + 1,
                      title: `Workout Day ${dayFields.length + 1}`,
                      notes: "",
                      exercises: [
                        {
                          name: "",
                          sets: 3,
                          reps: "10-12",
                          restTime: 60,
                          notes: "",
                          videoUrl: "",
                          videoType: "YOUTUBE",
                          order: 1,
                        },
                      ],
                    })
                  }
                  className="h-9 px-4 text-sm font-medium border-border/70 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Training Day
                </Button>
              </div>

              <div className="space-y-5">
                {dayFields.map((dayItem, dayIndex) => (
                  <DayCard
                    key={dayItem.id}
                    dayIndex={dayIndex}
                    control={control}
                    setValue={form.setValue}
                    removeDay={() => removeDay(dayIndex)}
                    totalDays={dayFields.length}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* ── Sticky mobile save bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-background/90 backdrop-blur-md border-t border-border/60 px-4 py-3 flex gap-3">
        <Link
          href="/owner/workouts"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "flex-1 h-11 font-medium"
          )}
        >
          Cancel
        </Link>
        <Button
          onClick={handleSubmit(onSubmit, onError)}
          disabled={isSubmitting}
          className="flex-1 h-11 font-medium shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSubmitting ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({
  dayIndex,
  control,
  setValue,
  removeDay,
  totalDays,
}: any) {
  const [uploadingExIdx, setUploadingExIdx] = useState<number | null>(null);

  const {
    fields: exFields,
    append: appendEx,
    remove: removeEx,
  } = useFieldArray({ control, name: `days.${dayIndex}.exercises` });

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    exIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    setUploadingExIdx(exIndex);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "exercise");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setValue(`days.${dayIndex}.exercises.${exIndex}.videoUrl`, data.url);
        setValue(
          `days.${dayIndex}.exercises.${exIndex}.videoType`,
          "IMAGEKIT"
        );
        toast.success("Media uploaded successfully!");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to upload media.");
      }
    } catch {
      toast.error("Error connecting to upload service.");
    } finally {
      setUploadingExIdx(null);
    }
  };

  return (
    <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
      {/* Day Header */}
      <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
            {dayIndex + 1}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Day {dayIndex + 1}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Training phase configuration
            </p>
          </div>
        </div>
        {totalDays > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeDay}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Remove Day
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Title + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`days.${dayIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Day Title
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Upper Body Push"
                    className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`days.${dayIndex}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Coaching Note{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Specific instructions for this day..."
                    className="h-10 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Exercises section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
              Exercises
              {exFields.length > 0 && (
                <span className="ml-1 text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {exFields.length}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendEx({
                  name: "",
                  sets: 3,
                  reps: "10-12",
                  restTime: 60,
                  notes: "",
                  videoUrl: "",
                  videoType: "YOUTUBE",
                  order: exFields.length + 1,
                })
              }
              className="h-8 px-3 text-xs font-medium border-border/70 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Exercise
            </Button>
          </div>

          {/* Empty state */}
          {exFields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border/60 bg-muted/10 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No exercises yet
              </p>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Add at least one exercise to configure this training day.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEx({
                    name: "",
                    sets: 3,
                    reps: "10-12",
                    restTime: 60,
                    notes: "",
                    videoUrl: "",
                    videoType: "YOUTUBE",
                    order: 1,
                  })
                }
                className="h-9 px-4 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Exercise
              </Button>
            </div>
          )}

          {/* Exercise cards */}
          <div className="space-y-3">
            {exFields.map((exItem, exIndex) => (
              <ExerciseCard
                key={exItem.id}
                dayIndex={dayIndex}
                exIndex={exIndex}
                control={control}
                setValue={setValue}
                removeEx={() => removeEx(exIndex)}
                uploadingExIdx={uploadingExIdx}
                handleVideoUpload={handleVideoUpload}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({
  dayIndex,
  exIndex,
  control,
  setValue,
  removeEx,
  uploadingExIdx,
  handleVideoUpload,
}: any) {
  return (
    <div className="relative group rounded-xl border border-border/60 bg-card p-4 hover:border-border hover:shadow-sm transition-all">
      {/* Exercise number + Remove */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center border border-border/50">
            {exIndex + 1}
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Exercise
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={removeEx}
          className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Main row: Name + Sets + Reps + Rest */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        {/* Exercise name */}
        <div className="sm:col-span-5">
          <FormField
            control={control}
            name={`days.${dayIndex}.exercises.${exIndex}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Exercise Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Barbell Back Squat"
                    className="h-9 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sets */}
        <div className="sm:col-span-2">
          <FormField
            control={control}
            name={`days.${dayIndex}.exercises.${exIndex}.sets`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground sm:text-center sm:block">
                  Sets
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="h-9 text-sm sm:text-center bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reps */}
        <div className="sm:col-span-2">
          <FormField
            control={control}
            name={`days.${dayIndex}.exercises.${exIndex}.reps`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground sm:text-center sm:block">
                  Reps
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="10-12"
                    className="h-9 text-sm sm:text-center bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rest */}
        <div className="sm:col-span-3">
          <FormField
            control={control}
            name={`days.${dayIndex}.exercises.${exIndex}.restTime`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Rest (seconds)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="h-9 text-sm bg-background border-border/70 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Second row: Notes + Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border/40">
        {/* Notes */}
        <FormField
          control={control}
          name={`days.${dayIndex}.exercises.${exIndex}.notes`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Form Cues{" "}
                <span className="text-muted-foreground/60">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Tempo, depth, breathing cues..."
                  className="h-8 text-xs bg-muted/30 border-dashed border-border/60 rounded-lg focus-visible:border-primary/50 focus-visible:ring-0 transition-colors placeholder:text-muted-foreground/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video URL + Upload */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Video / GIF{" "}
            <span className="text-muted-foreground/60">(Optional)</span>
          </p>
          <div className="flex items-center gap-2">
            <FormField
              control={control}
              name={`days.${dayIndex}.exercises.${exIndex}.videoUrl`}
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Paste YouTube URL..."
                    className="h-8 text-xs flex-1 bg-muted/30 border-dashed border-border/60 rounded-lg focus-visible:border-primary/50 focus-visible:ring-0 transition-colors placeholder:text-muted-foreground/50"
                    onChange={(e) => {
                      field.onChange(e);
                      if (
                        e.target.value.includes("youtube.com") ||
                        e.target.value.includes("youtu.be")
                      ) {
                        setValue(
                          `days.${dayIndex}.exercises.${exIndex}.videoType`,
                          "YOUTUBE"
                        );
                      }
                    }}
                  />
                </FormControl>
              )}
            />
            <div className="relative shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingExIdx === exIndex}
                className="h-8 px-3 text-xs border-dashed border-border/70 bg-muted/20 hover:bg-muted/50 transition-colors"
              >
                {uploadingExIdx === exIndex ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                )}
                Upload
              </Button>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept="image/gif,video/mp4,video/webm"
                disabled={uploadingExIdx === exIndex}
                onChange={(e) => handleVideoUpload(e, exIndex)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
