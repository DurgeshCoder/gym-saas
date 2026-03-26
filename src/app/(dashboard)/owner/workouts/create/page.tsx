"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlanSchema } from "@/modules/workout/workout.schema";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Dumbbell } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof createPlanSchema>;

export default function CreateWorkoutPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
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
                    title: "Day 1",
                    exercises: [{ name: "", sets: 3, reps: "10-12", restTime: 60, order: 1 }]
                }
            ]
        }
    });

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
                toast.success("Workout plan created!");
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
        toast.error("Please check the form for validation errors.");
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-sm";
    const labelCls = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2";
    const errorCls = "text-xs text-rose-500 font-bold mt-1";

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/owner/workouts" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Workout Plan</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Design a structured multi-day routine for your members.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit(onSubmit, onError)} disabled={isSubmitting} size="lg" className="rounded-xl shadow-lg shadow-emerald-500/20 font-black bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Plan"}
                </Button>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(onSubmit, onError)}>
                {/* Core Info */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">General Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Plan Name</label>
                            <input {...register("name")} placeholder="e.g. 30-Day Shred" className={inputCls} />
                            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Description (Optional)</label>
                            <textarea {...register("description")} rows={3} placeholder="Describe the goal and structure of this plan..." className={inputCls} />
                        </div>

                        <div>
                            <label className={labelCls}>Difficulty</label>
                            <select {...register("difficulty")} className={inputCls}>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Primary Goal</label>
                            <select {...register("goal")} className={inputCls}>
                                <option value="FAT_LOSS">Fat Loss</option>
                                <option value="MUSCLE_GAIN">Muscle Gain</option>
                                <option value="STRENGTH">Strength</option>
                                <option value="GENERAL_FITNESS">General Fitness</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Duration (Days)</label>
                            <input type="number" {...register("duration", { valueAsNumber: true })} className={inputCls} min={1} />
                            {errors.duration && <p className={errorCls}>{errors.duration.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Days & Exercises */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Workout Days Structure</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendDay({ dayNumber: dayFields.length + 1, title: `Day ${dayFields.length + 1}`, exercises: [{ name: "", sets: 3, reps: "10-12", restTime: 60, order: 1 }] })} className="font-bold flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Day
                        </Button>
                    </div>

                    {dayFields.map((dayItem, dayIndex) => (
                        <DayComponent
                            key={dayItem.id}
                            dayIndex={dayIndex}
                            control={control}
                            register={register}
                            removeDay={() => removeDay(dayIndex)}
                            totalDays={dayFields.length}
                        />
                    ))}
                    {errors.days && <p className={errorCls}>Please ensure all dates and exercises are valid.</p>}
                </div>
            </form>
        </div>
    );
}

// Sub-component to handle nested exercises field array cleanly
function DayComponent({ dayIndex, control, register, removeDay, totalDays }: any) {
    const { fields: exFields, append: appendEx, remove: removeEx } = useFieldArray({
        control,
        name: `days.${dayIndex}.exercises`
    });

    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900 dark:text-white transition-all";

    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative group overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors" />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pl-4 border-b border-slate-100 dark:border-slate-700/50 pb-6">
                <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Day Title / Muscle Group</label>
                    <div className="flex items-center gap-3 w-full max-w-md">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-500">
                            {dayIndex + 1}
                        </span>
                        <input
                            {...register(`days.${dayIndex}.title`)}
                            placeholder="e.g. Day 1 - Back & Biceps"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEx({ name: "", sets: 3, reps: "10-12", restTime: 60, order: exFields.length + 1 })} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 border-0 flex items-center gap-1.5 transition-colors">
                        <Dumbbell className="w-3.5 h-3.5" /> Add Exercise
                    </Button>
                    {totalDays > 1 && (
                        <Button type="button" variant="destructive" size="icon" onClick={removeDay} className="w-9 h-9 border-none shadow-none rounded-lg text-rose-500">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="pl-4 space-y-3">
                {exFields.length === 0 && <p className="text-xs text-slate-400 font-medium italic py-4">No exercises added to this day.</p>}

                {exFields.map((exItem, exIndex) => (
                    <div key={exItem.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50/50 dark:bg-slate-800/50 p-2 md:p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="col-span-12 md:col-span-5 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{exIndex + 1}.</span>
                            <input {...register(`days.${dayIndex}.exercises.${exIndex}.name`)} placeholder="Exercise Name" required className={`${inputCls} pl-8`} />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                            <div className="relative">
                                <input type="number" {...register(`days.${dayIndex}.exercises.${exIndex}.sets`, { valueAsNumber: true })} required min={1} className={`${inputCls} pr-8`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Sets</span>
                            </div>
                        </div>
                        <div className="col-span-4 md:col-span-2">
                            <div className="relative">
                                <input type="text" {...register(`days.${dayIndex}.exercises.${exIndex}.reps`)} placeholder="8-10" required className={`${inputCls} pr-8`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Reps</span>
                            </div>
                        </div>
                        <div className="col-span-4 md:col-span-2">
                            <div className="relative">
                                <input type="number" {...register(`days.${dayIndex}.exercises.${exIndex}.restTime`, { valueAsNumber: true })} required min={0} className={`${inputCls} pr-10`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Secs</span>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex justify-end">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEx(exIndex)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
