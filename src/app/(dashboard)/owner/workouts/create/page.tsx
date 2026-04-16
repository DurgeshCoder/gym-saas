"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlanSchema } from "@/modules/workout/workout.schema";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Dumbbell, Info, Calendar } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
                    exercises: [{ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: 1 }]
                }
            ]
        }
    });

    const { control, handleSubmit } = form;

    const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
        control,
        name: "days"
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            // Auto-assign order based on array indices
            data.days.forEach((day, dIdx) => {
                day.dayNumber = dIdx + 1;
                day.exercises.forEach((ex, eIdx) => ex.order = eIdx + 1);
            });

            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
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
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Minimal & Classic Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/owner/workouts"
                        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-md h-9 w-9 border-border bg-transparent shadow-sm")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Design Workout Plan</h1>
                        <p className="text-sm font-normal text-muted-foreground mt-1">Structurally build a custom training protocol for your members.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit(onSubmit, onError)} disabled={isSubmitting} size="sm" className="px-6 h-11 sm:h-9 w-full sm:w-auto font-medium shadow-sm transition-all active:scale-95 mt-4 sm:mt-0">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Generating..." : "Save Plan"}
                </Button>
            </div>

            <Form {...form}>
                <form className="pb-12">
                    <Tabs defaultValue="foundation" className="w-full">
                        <TabsList className="flex w-full justify-start h-auto bg-transparent p-0 mb-6 rounded-none border-b border-border/60 gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x flex-nowrap">
                            <TabsTrigger 
                                value="foundation" 
                                className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground text-sm transition-colors whitespace-nowrap snap-start shrink-0"
                            >
                                Base Plan Details
                            </TabsTrigger>
                            <TabsTrigger 
                                value="schedule" 
                                className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground text-sm transition-colors whitespace-nowrap snap-start shrink-0"
                            >
                                Daily Routine
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="foundation" className="mt-6 space-y-6 animate-in fade-in-50 duration-500">
                            {/* Section 1: Basic Information */}
                            <Card className="shadow-sm border border-border/50 bg-card rounded-xl overflow-hidden">
                                <CardHeader className="border-b border-border/50 py-5 px-6">
                                    <CardTitle className="text-xl font-semibold text-foreground tracking-tight">Core Foundation</CardTitle>
                                    <CardDescription className="text-sm mt-1">High-level parameters for your custom plan</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium">Plan Directive Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g. 12-Week Hypertrophy Protocol" className="h-10 text-sm shadow-sm rounded-md transition-all border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <FormField
                                                control={control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium">Strategic Overview (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} rows={3} placeholder="Provide a summary of what this plan aims to achieve..." className="resize-none text-sm shadow-sm rounded-md transition-all border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={control}
                                            name="difficulty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Intensity Level</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 shadow-sm rounded-md border-border bg-background">
                                                                <SelectValue placeholder="Select intensity" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-md">
                                                            <SelectItem value="BEGINNER" className="text-sm">Beginner / Novice</SelectItem>
                                                            <SelectItem value="INTERMEDIATE" className="text-sm">Intermediate</SelectItem>
                                                            <SelectItem value="ADVANCED" className="text-sm">Advanced / Elite</SelectItem>
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
                                                    <FormLabel className="text-sm font-medium">Primary Objective</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 shadow-sm rounded-md border-border bg-background">
                                                                <SelectValue placeholder="Select objective" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-md">
                                                            <SelectItem value="FAT_LOSS" className="text-sm">Fat Loss & Leaning</SelectItem>
                                                            <SelectItem value="MUSCLE_GAIN" className="text-sm">Muscle Gain (Hypertrophy)</SelectItem>
                                                            <SelectItem value="STRENGTH" className="text-sm">Raw Strength</SelectItem>
                                                            <SelectItem value="GENERAL_FITNESS" className="text-sm">General Conditioning</SelectItem>
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
                                                    <FormLabel className="text-sm font-medium">Duration Lifecycle (Days)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} min={1} className="h-10 shadow-sm rounded-md border-border bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule" className="mt-6 animate-in fade-in-50 duration-500">
                            {/* Section 2: Days Configuration */}
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
                                    <div>
                                        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                            Daily Routine
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">Plan out the daily exercises for this workout program.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendDay({
                                            dayNumber: dayFields.length + 1,
                                            title: `Workout Day ${dayFields.length + 1}`,
                                            notes: "",
                                            exercises: [{ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: 1 }]
                                        })}
                                        className="h-9 px-4 font-medium transition-all shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Next Training Phase
                                    </Button>
                                </div>

                                <div className="space-y-6 mt-4">
                                    {dayFields.map((dayItem, dayIndex) => (
                                        <DayItem
                                            key={dayItem.id}
                                            dayIndex={dayIndex}
                                            control={control}
                                            removeDay={() => removeDay(dayIndex)}
                                            totalDays={dayFields.length}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}

// Professional & Segmented Day Component
function DayItem({ dayIndex, control, removeDay, totalDays }: any) {
    const { fields: exFields, append: appendEx, remove: removeEx } = useFieldArray({
        control,
        name: `days.${dayIndex}.exercises`
    });

    return (
        <Card className="shadow-sm border border-border/50 bg-card rounded-xl overflow-hidden mb-6">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between py-5 px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground shadow-sm px-3 py-1.5 h-9 rounded-md flex items-center justify-center font-semibold text-sm whitespace-nowrap min-w-[3.5rem] shrink-0">
                        Day {dayIndex + 1}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Phase Focus & Dynamics</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Configure target muscle groups for this phase</p>
                    </div>
                </div>
                {totalDays > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeDay} className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 h-8 px-3 rounded-md transition-colors text-xs font-medium">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove Phase
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-background/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name={`days.${dayIndex}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Target Focus</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Posterior Chain & Core" className="h-10 text-sm shadow-sm rounded-md border-border bg-background flex-1" />
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
                                <FormLabel className="text-sm font-medium">Coaching Directive (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Specific instructions for this block..." className="h-10 text-sm shadow-sm rounded-md border-border bg-background" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-muted-foreground" />
                            <h4 className="text-sm font-semibold tracking-tight text-foreground">
                                Movement Inventory
                            </h4>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => appendEx({ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: exFields.length + 1 })}
                            className="h-8 px-3 text-xs font-medium shadow-sm rounded-md transition-all"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Movement
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {exFields.map((exItem, exIndex) => (
                            <div key={exItem.id} className="p-5 border border-border/60 rounded-xl bg-card space-y-5 relative group transition-all hover:border-border hover:shadow-sm">
                                {/* Delete Button - Reveals on hover */}
                                <div className="absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeEx(exIndex)}
                                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                                    <div className="xl:col-span-4 flex items-start gap-3">
                                        <div className="mt-7 w-6 h-6 rounded-md bg-muted text-xs font-medium flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                                            {exIndex + 1}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <FormField
                                                control={control}
                                                name={`days.${dayIndex}.exercises.${exIndex}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Movement Isolation</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g. Bulgarian Split Squats" className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:col-span-8 grid grid-cols-1 min-[450px]:grid-cols-3 gap-4 mt-2 xl:mt-0">
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.sets`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium text-muted-foreground min-[450px]:text-center block">Volume Sets</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="min-[450px]:text-center shadow-sm rounded-md border-border bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.reps`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium text-muted-foreground min-[450px]:text-center block">Rep Range</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="10-12" className="min-[450px]:text-center shadow-sm rounded-md border-border bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.restTime`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium text-muted-foreground min-[450px]:text-center block">Rest (sec)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="min-[450px]:text-center shadow-sm rounded-md border-border bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="xl:col-span-12 xl:pl-9 mt-2 xl:mt-[-0.5rem]">
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.notes`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="sr-only">Form Cues / Internal Mechanics</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Target depth, tempo parameters, or biomechanical cues..." className="h-8 text-xs bg-muted/30 border-dashed border-border/80 rounded-md focus-visible:border-primary/50 shadow-none text-muted-foreground placeholder:text-muted-foreground/60 transition-colors" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {exFields.length === 0 && (
                            <div className="text-center py-10 border border-dashed rounded-xl border-border bg-muted/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center mx-auto mb-3 shadow-sm border border-border/50">
                                  <Dumbbell className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-sm text-foreground">No Movements Configured</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">You need at least one movement to construct a day phase.</p>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => appendEx({ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: exFields.length + 1 })}
                                  className="h-8 px-4 rounded-md text-xs font-medium shadow-sm"
                                >
                                  Instantiate Movement
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
