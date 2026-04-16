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
                    foodItems: [{ name: "", protein: 0, carbs: 0, fats: 0, calories: 0, quantity: 1, unit: "serving" }]
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
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Minimal & Classic Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/owner/diets"
                        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-md h-9 w-9 border-border bg-transparent shadow-sm")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Design Diet Plan</h1>
                        <p className="text-sm font-normal text-muted-foreground mt-1">Structurally build a custom nutrition protocol for your members.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit(onSubmit, onError)} disabled={isSubmitting} size="sm" className="px-6 h-9 font-medium shadow-sm transition-all active:scale-95">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Generating..." : "Save Plan"}
                </Button>
            </div>

            <Form {...form}>
                <form className="pb-12">
                    <Tabs defaultValue="foundation" className="w-full">
                        <TabsList className="flex w-full justify-start h-12 bg-transparent p-0 mb-6 rounded-none border-b border-border/60 gap-6">
                            <TabsTrigger 
                                value="foundation" 
                                className="relative rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground text-sm transition-colors"
                            >
                                Base Plan Details
                            </TabsTrigger>
                            <TabsTrigger 
                                value="meals" 
                                className="relative rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground text-sm transition-colors"
                            >
                                Daily Routine
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="foundation" className="mt-6 space-y-6 animate-in fade-in-50 duration-500">
                            {/* Section 1: Basic Information */}
                            <Card className="shadow-sm border border-border/50 bg-card rounded-xl overflow-hidden">
                                <CardHeader className="border-b border-border/50 py-5 px-6">
                                    <CardTitle className="text-xl font-semibold text-foreground tracking-tight">Core Foundation</CardTitle>
                                    <CardDescription className="text-sm mt-1">High-level parameters for your custom diet plan</CardDescription>
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
                                                            <Input {...field} placeholder="e.g. High Protein Keto" className="h-10 text-sm shadow-sm rounded-md transition-all border-border bg-background" />
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
                                                            <Textarea {...field} rows={3} placeholder="Provide a summary of what this diet aims to achieve..." className="resize-none text-sm shadow-sm rounded-md transition-all border-border bg-background" />
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
                                                    <FormLabel className="text-sm font-medium">Primary Objective</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 shadow-sm rounded-md border-border bg-background">
                                                                <SelectValue placeholder="Select objective" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-md">
                                                            <SelectItem value="WEIGHT_LOSS" className="text-sm">Weight Loss / Cut</SelectItem>
                                                            <SelectItem value="MUSCLE_GAIN" className="text-sm">Muscle Gain / Bulk</SelectItem>
                                                            <SelectItem value="MAINTENANCE" className="text-sm">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={control}
                                            name="totalCalories"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Target Calories (Daily)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} min={0} className="h-10 shadow-sm rounded-md border-border bg-background" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="meals" className="mt-6 animate-in fade-in-50 duration-500">
                            {/* Section 2: Meals Configuration */}
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
                                    <div>
                                        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-muted-foreground" />
                                            Daily Routine
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">Plan out the daily meals for this diet program.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendMeal({
                                            mealType: "LUNCH",
                                            time: "12:00 PM",
                                            foodItems: [{ name: "", protein: 0, carbs: 0, fats: 0, calories: 0, quantity: 1, unit: "serving" }]
                                        })}
                                        className="h-9 px-4 font-medium transition-all shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Next Meal Phase
                                    </Button>
                                </div>

                                <div className="space-y-6 mt-4">
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
                        </TabsContent>
                    </Tabs>
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
        <Card className="shadow-sm border border-border/50 bg-card rounded-xl overflow-hidden mb-6">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between py-5 px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground shadow-sm px-3 py-1.5 h-9 rounded-md flex items-center justify-center font-semibold text-sm whitespace-nowrap min-w-[3.5rem] shrink-0">
                        Meal {mealIndex + 1}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Meal Phase Details</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Configure timing and nutritional structure</p>
                    </div>
                </div>
                {totalMeals > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeMeal} className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 h-8 px-3 rounded-md transition-colors text-xs font-medium">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove Phase
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-background/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name={`meals.${mealIndex}.mealType`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Meal Type</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="h-10 text-sm shadow-sm rounded-md border-border bg-background">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-md">
                                        <SelectItem value="BREAKFAST" className="text-sm">Breakfast</SelectItem>
                                        <SelectItem value="LUNCH" className="text-sm">Lunch</SelectItem>
                                        <SelectItem value="DINNER" className="text-sm">Dinner</SelectItem>
                                        <SelectItem value="SNACK" className="text-sm">Snack</SelectItem>
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
                                <FormLabel className="text-sm font-medium">Target Time (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. 08:00 AM" className="h-10 text-sm shadow-sm rounded-md border-border bg-background flex-1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-muted-foreground" />
                            <h4 className="text-sm font-semibold tracking-tight text-foreground">
                                Food Inventory
                            </h4>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => appendFood({ name: "", protein: 0, carbs: 0, fats: 0, calories: 0, quantity: 1, unit: "serving" })}
                            className="h-8 px-3 text-xs font-medium shadow-sm rounded-md transition-all"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Food
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {foodFields.map((foodItem, foodIndex) => (
                            <div key={foodItem.id} className="p-5 border border-border/60 rounded-xl bg-card space-y-5 relative group transition-all hover:border-border hover:shadow-sm">
                                {/* Delete Button - Reveals on hover */}
                                <div className="absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFood(foodIndex)}
                                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                                    <div className="xl:col-span-4 flex items-start gap-3">
                                        <div className="mt-7 w-6 h-6 rounded-md bg-muted text-xs font-medium flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                                            {foodIndex + 1}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Food Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g. Rolled Oats" className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:col-span-8 grid grid-cols-6 gap-3 lg:gap-4 pr-0 xl:pr-6">
                                        <div className="col-span-3 sm:col-span-2">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Qty</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3 sm:col-span-2">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Unit</FormLabel>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9 text-sm shadow-sm rounded-md border-border bg-background px-2">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-md">
                                                                <SelectItem value="g" className="text-sm">g</SelectItem>
                                                                <SelectItem value="serving" className="text-sm">srv</SelectItem>
                                                                <SelectItem value="ml" className="text-sm">ml</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-2">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.calories`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400">Calories</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-9 text-sm shadow-sm rounded-md border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 font-semibold" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Macros */}
                                        <div className="col-span-2 pt-2 border-t border-border/50 sm:border-t-0 sm:pt-0">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.protein`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Prot (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-border/50 sm:border-t-0 sm:pt-0">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.carbs`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Carbs (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-border/50 sm:border-t-0 sm:pt-0">
                                            <FormField
                                                control={control}
                                                name={`meals.${mealIndex}.foodItems.${foodIndex}.fats`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium text-muted-foreground">Fats (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-9 text-sm shadow-sm rounded-md border-border bg-background" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {foodFields.length === 0 && (
                            <div className="text-center py-10 border border-dashed rounded-xl border-border bg-muted/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center mx-auto mb-3 shadow-sm border border-border/50">
                                  <Utensils className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-sm text-foreground">No Foods Configured</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">You need at least one food item to construct a meal.</p>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => appendFood({ name: "", protein: 0, carbs: 0, fats: 0, calories: 0, quantity: 1, unit: "serving" })}
                                  className="h-8 px-4 rounded-md text-xs font-medium shadow-sm"
                                >
                                  Instantiate Food Item
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
