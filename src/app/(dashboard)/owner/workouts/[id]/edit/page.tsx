"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditWorkoutPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (!id) return;
        fetch(`/api/workouts/${id}`).then(res => res.json()).then(json => {
            if (json.data) {
                const plan = json.data;
                const sanitizedData = {
                    ...plan,
                    description: plan.description || "",
                    days: plan.days?.map((day: any) => ({
                        ...day,
                        title: day.title || "",
                        notes: day.notes || "",
                        exercises: day.exercises?.map((ex: any) => ({
                            ...ex,
                            notes: ex.notes || "",
                        })) || []
                    })) || []
                };
                form.reset(sanitizedData);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            toast.error("Failed to load workout plan");
            setIsLoading(false);
        });
    }, [id, form]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            // Auto-assign order based on array indices
            data.days.forEach((day, dIdx) => {
                day.dayNumber = dIdx + 1;
                day.exercises.forEach((ex, eIdx) => ex.order = eIdx + 1);
            });

            const res = await fetch(`/api/workouts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success("Workout plan updated successfully!");
                router.push("/owner/workouts");
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to update plan");
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

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading workout plan...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            {/* Simple Classic Header */}
            <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/owner/workouts"
                        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Workout Plan</h1>
                        <p className="text-sm text-muted-foreground italic">Update the custom training schedule for your members.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit(onSubmit, onError)} disabled={isSubmitting} className="px-8 font-bold">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Plan"}
                </Button>
            </div>

            <Form {...form}>
                <form className="space-y-10">
                    {/* Section 1: Basic Information */}
                    <Card className="shadow-none border-border">
                        <CardHeader className="border-b bg-muted/30 dark:bg-muted/10">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="w-4 h-4 text-muted-foreground" />
                                Base Plan Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold">Plan Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Strength & Conditioning Protocol" />
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
                                                <FormLabel className="text-sm font-semibold">Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={3} placeholder="Briefly describe the objective of this plan..." className="resize-none" />
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
                                            <FormLabel className="text-sm font-semibold">Difficulty Level</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select difficulty" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
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
                                            <FormLabel className="text-sm font-semibold">Primary Goal</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select goal" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="FAT_LOSS">Fat Loss</SelectItem>
                                                    <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                                                    <SelectItem value="STRENGTH">Strength</SelectItem>
                                                    <SelectItem value="GENERAL_FITNESS">General Fitness</SelectItem>
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
                                            <FormLabel className="text-sm font-semibold">Plan Duration (Days)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} min={1} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Days Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                                Workout Schedule
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendDay({
                                    dayNumber: dayFields.length + 1,
                                    title: `Workout Day ${dayFields.length + 1}`,
                                    notes: "",
                                    exercises: [{ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: 1 }]
                                })}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Day
                            </Button>
                        </div>

                        <Separator />

                        <div className="space-y-8">
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
                </form>
            </Form>
        </div>
    );
}

// Simple and Classic Day Component
function DayItem({ dayIndex, control, removeDay, totalDays }: any) {
    const { fields: exFields, append: appendEx, remove: removeEx } = useFieldArray({
        control,
        name: `days.${dayIndex}.exercises`
    });

    return (
        <Card className="border-border overflow-hidden shadow-sm bg-card">
            <CardHeader className="bg-muted/50 dark:bg-muted/20 border-b flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {dayIndex + 1}
                    </div>
                    <CardTitle className="text-base font-bold">Phase Configuration</CardTitle>
                </div>
                {totalDays > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeDay} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Day
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name={`days.${dayIndex}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Target Focus</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Upper Body Power" className="bg-background" />
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
                                <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Coaching Tip (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Specific instructions for this phase..." className="bg-background" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-muted-foreground" />
                            Exercise Routine
                        </h4>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => appendEx({ name: "", sets: 3, reps: "10-12", restTime: 60, notes: "", order: exFields.length + 1 })}
                            className="h-8 text-xs font-bold"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Movement
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {exFields.map((exItem, exIndex) => (
                            <div key={exItem.id} className="p-4 border border-border rounded-xl bg-muted/20 dark:bg-muted/5 space-y-4 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEx(exIndex)}
                                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground/50 hover:text-destructive rounded-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-muted-foreground">Movement Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. Barbell Squats" className="bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                                        <FormField
                                            control={control}
                                            name={`days.${dayIndex}.exercises.${exIndex}.sets`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-muted-foreground">Sets</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background text-center font-bold" />
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
                                                    <FormLabel className="text-xs font-bold text-muted-foreground">Reps</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="10-12" className="bg-background text-center font-bold" />
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
                                                    <FormLabel className="text-xs font-bold text-muted-foreground">Rest (s)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background text-center font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <FormField
                                        control={control}
                                        name={`days.${dayIndex}.exercises.${exIndex}.notes`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold text-muted-foreground/70 italic uppercase tracking-wider">Instructions / Form Cues</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Setup instructions, cadence, or cues..." className="bg-background h-9 text-xs" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}

                        {exFields.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed rounded-xl border-muted italic text-muted-foreground text-sm">
                                <Dumbbell className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                                Ready to add movements to this routine.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
