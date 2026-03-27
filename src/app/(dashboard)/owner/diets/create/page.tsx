"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDietPlanSchema } from "@/modules/diet/diet.schema";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Info, Utensils } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

type FormValues = z.infer<typeof createDietPlanSchema>;

export default function CreateDietPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(createDietPlanSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "MAINTENANCE",
            totalCalories: 0,
            meals: [
                {
                    mealType: "BREAKFAST",
                    time: "08:00 AM",
                    foodItems: [{ name: "", protein: 0, carbs: 0, fats: 0, calories: 0 }]
                }
            ]
        }
    });

    const { control, handleSubmit } = form;

    const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
        control,
        name: "meals"
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/diets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success("Diet plan created successfully!");
                router.push("/owner/diets");
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
        toast.error("Please fill in all required fields correctly.");
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/owner/diets"
                        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Diet Plan</h1>
                        <p className="text-sm text-muted-foreground italic">Build a custom nutrition schedule for your members.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit(onSubmit, onError)} disabled={isSubmitting} className="px-8 font-bold">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Save Plan"}
                </Button>
            </div>

            <Form {...form}>
                <form className="space-y-10">
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
                                                    <Input {...field} placeholder="e.g. High Protein Keto" />
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
                                                    <Textarea {...field} rows={3} placeholder="Briefly describe the objective of this diet..." className="resize-none" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                                    <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                                                    <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-emerald-600" />
                                Meals
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendMeal({
                                    mealType: "LUNCH",
                                    time: "12:00 PM",
                                    foodItems: [{ name: "", protein: 0, carbs: 0, fats: 0, calories: 0 }]
                                })}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Meal
                            </Button>
                        </div>

                        <Separator />

                        <div className="space-y-8">
                            {mealFields.map((mealItem, mealIndex) => (
                                <MealItem
                                    key={mealItem.id}
                                    mealIndex={mealIndex}
                                    control={control}
                                    removeMeal={() => removeMeal(mealIndex)}
                                    totalMeals={mealFields.length}
                                />
                            ))}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

function MealItem({ mealIndex, control, removeMeal, totalMeals }: any) {
    const { fields: foodFields, append: appendFood, remove: removeFood } = useFieldArray({
        control,
        name: `meals.${mealIndex}.foodItems`
    });

    return (
        <Card className="border-border overflow-hidden shadow-sm bg-card">
            <CardHeader className="bg-muted/50 dark:bg-muted/20 border-b flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {mealIndex + 1}
                    </div>
                    <CardTitle className="text-base font-bold">Meal Details</CardTitle>
                </div>
                {totalMeals > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeMeal} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Meal
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name={`meals.${mealIndex}.mealType`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Type</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                                        <SelectItem value="LUNCH">Lunch</SelectItem>
                                        <SelectItem value="DINNER">Dinner</SelectItem>
                                        <SelectItem value="SNACK">Snack</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`meals.${mealIndex}.time`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Time (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. 08:00 AM" className="bg-background" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-muted-foreground" />
                            Food Items
                        </h4>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => appendFood({ name: "", protein: 0, carbs: 0, fats: 0, calories: 0 })}
                            className="h-8 text-xs font-bold"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Food
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {foodFields.map((foodItem, foodIndex) => (
                            <div key={foodItem.id} className="p-4 border border-border rounded-xl bg-muted/20 dark:bg-muted/5 space-y-4 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFood(foodIndex)}
                                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground/50 hover:text-destructive rounded-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pr-6">
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`meals.${mealIndex}.foodItems.${foodIndex}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. Oats" className="bg-background h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`meals.${mealIndex}.foodItems.${foodIndex}.protein`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Protein (g)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-background h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`meals.${mealIndex}.foodItems.${foodIndex}.carbs`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Carbs (g)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-background h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`meals.${mealIndex}.foodItems.${foodIndex}.fats`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Fats (g)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-background h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <FormField
                                            control={control}
                                            name={`meals.${mealIndex}.foodItems.${foodIndex}.calories`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Calories</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-background h-8 text-sm font-bold text-emerald-600" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
