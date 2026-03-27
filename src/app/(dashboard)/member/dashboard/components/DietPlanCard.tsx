"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, UtensilsCrossed, Apple, User, Target, Flame } from "lucide-react";
import { MemberDashboardData } from "@/lib/queries/member";

type DietPlanData = NonNullable<MemberDashboardData>["dietPlan"];

interface DietPlanCardProps {
  memberDietPlan: DietPlanData;
}

const MealTypeOrder = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

export function DietPlanCard({ memberDietPlan }: DietPlanCardProps) {
  if (!memberDietPlan) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center space-y-3">
          <div className="p-4 bg-muted/50 rounded-full">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">No Diet Plan</h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t been assigned a diet plan yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { dietPlan, status } = memberDietPlan;
  const meals = [...(dietPlan.meals || [])].sort((a, b) => {
    return MealTypeOrder.indexOf(a.mealType) - MealTypeOrder.indexOf(b.mealType);
  });

  // Calculate totals
  const totalMacros = useMemo(() => {
    let p = 0, c = 0, f = 0, cal = 0;
    dietPlan.meals?.forEach(m => {
      m.foodItems?.forEach(item => {
        p += item.protein;
        c += item.carbs;
        f += item.fats;
        cal += item.calories;
      });
    });
    return { protein: p, carbs: c, fats: f, calories: cal };
  }, [dietPlan]);

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Apple className="w-32 h-32" />
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            My Diet Plan
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        <div>
          <h4 className="text-2xl font-black mb-1">{dietPlan.name}</h4>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
             <span className="flex items-center gap-1">
               <User className="w-4 h-4" /> By {dietPlan.creator.name}
             </span>
             &bull;
             <span className="flex items-center gap-1 capitalize">
               <Target className="w-4 h-4" /> {dietPlan.goal.replace("_", " ").toLowerCase()}
             </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-orange-600 font-bold flex items-center gap-1 mb-1 shadow-sm">
                 <Flame className="w-3 h-3 hidden sm:block" /> {dietPlan.totalCalories}
              </span>
              <span className="text-[10px] uppercase font-semibold text-orange-600/70">Kcal</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-red-600 font-bold mb-1">{Math.round(totalMacros.protein)}g</span>
              <span className="text-[10px] uppercase font-semibold text-red-600/70">Protein</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-blue-600 font-bold mb-1">{Math.round(totalMacros.carbs)}g</span>
              <span className="text-[10px] uppercase font-semibold text-blue-600/70">Carbs</span>
            </div>
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-yellow-700 font-bold mb-1">{Math.round(totalMacros.fats)}g</span>
              <span className="text-[10px] uppercase font-semibold text-yellow-700/70">Fats</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {meals.length > 0 ? meals.map((meal) => (
            <div key={meal.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center">
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">
                  {meal.mealType}
                </span>
                {meal.time && (
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
                    {meal.time}
                  </span>
                )}
              </div>
              <div className="p-2 space-y-1">
                {meal.foodItems.length > 0 ? meal.foodItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <span className="font-medium text-sm text-foreground">{item.name}</span>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="w-12 text-right">{item.calories} <span className="text-[10px]">kcal</span></span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No items listed</p>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 border rounded-xl flex flex-col items-center justify-center">
              <Apple className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">No meals assigned</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
