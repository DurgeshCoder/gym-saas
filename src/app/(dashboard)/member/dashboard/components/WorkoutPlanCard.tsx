"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity, Dumbbell, User, ListChecks } from "lucide-react";
import { MemberDashboardData } from "@/lib/queries/member";

type WorkoutPlanData = NonNullable<MemberDashboardData>["workoutPlan"];

interface WorkoutPlanCardProps {
  memberWorkoutPlan: WorkoutPlanData;
}

export function WorkoutPlanCard({ memberWorkoutPlan }: WorkoutPlanCardProps) {
  if (!memberWorkoutPlan) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center space-y-3">
          <div className="p-4 bg-muted/50 rounded-full">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">No Workout Plan</h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t been assigned a workout plan yet. Speak to your trainer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { workoutPlan, status } = memberWorkoutPlan;
  const days = workoutPlan.days;

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Dumbbell className="w-32 h-32" />
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            My Workout Plan
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        <div>
          <h4 className="text-2xl font-black mb-1">{workoutPlan.name}</h4>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
             <span className="flex items-center gap-1">
               <User className="w-4 h-4" /> By {workoutPlan.creator.name}
             </span>
             &bull;
             <span>{workoutPlan.duration} Days</span>
             &bull;
             <span className="capitalize">{workoutPlan.difficulty.toLowerCase()}</span>
          </div>
        </div>

        {days && days.length > 0 ? (
          <Tabs defaultValue={days[0].id} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto pb-2 flex-nowrap bg-muted/50 rounded-lg p-1 border">
              {days.map((day: any) => (
                <TabsTrigger key={day.id} value={day.id} className="rounded-md shrink-0">
                  Day {day.dayNumber}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {days.map((day: any) => (
              <TabsContent key={day.id} value={day.id} className="mt-4 focus-visible:outline-none">
                <div className="mb-4">
                  <h5 className="font-semibold text-lg">{day.title || `Day ${day.dayNumber}`}</h5>
                  {day.notes && <p className="text-sm text-muted-foreground mt-1 bg-muted p-3 border-l-2 border-primary rounded-r-lg">{day.notes}</p>}
                </div>
                
                {day.exercises.length > 0 ? (
                  <Accordion className="w-full space-y-2">
                    {day.exercises.map((exercise: any, idx: number) => (
                      <AccordionItem key={exercise.id} value={exercise.id} className="bg-card border rounded-xl px-1 overflow-hidden shadow-sm">
                        <AccordionTrigger className="hover:no-underline px-4 py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="flex items-center justify-center bg-primary/10 w-7 h-7 rounded-full text-xs font-bold text-primary shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-[15px]">{exercise.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div className="bg-muted/50 p-2.5 rounded-lg border flex justify-between items-center">
                              <span className="font-semibold text-xs uppercase tracking-wider">Sets</span>
                              <span className="text-foreground font-medium">{exercise.sets}</span>
                            </div>
                            <div className="bg-muted/50 p-2.5 rounded-lg border flex justify-between items-center">
                              <span className="font-semibold text-xs uppercase tracking-wider">Reps</span>
                              <span className="text-foreground font-medium">{exercise.reps}</span>
                            </div>
                            <div className="col-span-2 bg-muted/50 p-2.5 rounded-lg border flex justify-between items-center">
                              <span className="font-semibold text-xs uppercase tracking-wider">Rest</span>
                              <span className="text-foreground font-medium">{exercise.restTime}s</span>
                            </div>
                            {exercise.notes && (
                              <div className="col-span-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg border border-yellow-500/20 mt-1">
                                <span className="font-bold block mb-1 text-xs uppercase tracking-wider">Trainer Notes:</span>
                                <span>{exercise.notes}</span>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 border rounded-xl flex flex-col items-center justify-center">
                    <ListChecks className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-medium">Rest Day</p>
                    <p className="text-sm opacity-70">Take a break to recover</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center border rounded-xl bg-muted/20">
            No daily schedule defined.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
