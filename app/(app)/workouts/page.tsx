"use client";

import WorkoutPlan from "@/components/workout-plan";
import { useCallback, useEffect, useState } from "react";
import { fetchDailyWorkouts } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useWorkoutContext } from "@/providers/workout-provider";

import DailyExerciseCard from "@/components/daily-exercise-card";

import StyledWorkoutPlan from "@/components/styled-workout-plan";

interface WorkoutEntry {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function Page() {
  const session = useSupabaseSession();
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const [workoutId, setWorkoutId] = useState(null);
  const [exercisesGroupedByDay, setExercisesGroupedByDay] = useState<
    Record<number, WorkoutEntry[]>
  >({});
  const [workoutName, setWorkoutName] = useState("");
  const { isCreatingWorkout } = useWorkoutContext();
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [date] = useState<Date | undefined>(new Date());
  const [, setIsMobile] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleNextDayClick = () => {
    setCurrentDayIndex((prev) => (prev + 1) % days.length);
  };

  const handlePrevDayClick = () => {
    setCurrentDayIndex((prev) => (prev - 1 + days.length) % days.length);
  };

  const returnDailyWorkouts = useCallback(async () => {
    if (!session || !session.user) return;

    const data = await fetchDailyWorkouts(session);

    if (!data || data.length === 0) {
      setIsLoading(false);
      setHasStoredWorkout(false);
      return;
    }

    setWorkoutId(data[0].id);
    setHasStoredWorkout(true);
    setIsLoading(false);
    const dailyExercises = data[0].days;
    setWorkoutName(data[0].name);
    setExercisesGroupedByDay(dailyExercises);
  }, [
    session,
    setIsLoading,
    setHasStoredWorkout,
    setWorkoutName,
    setExercisesGroupedByDay,
  ]);

  useEffect(() => {
    returnDailyWorkouts();
  }, [returnDailyWorkouts]);

  useEffect(() => {
    const today = new Date().getDay();
    setCurrentDayIndex(today - 1);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="container mx-auto py-10 w-11/12">
        <div className="flex flex-col min-h-76 items-start pb-10 sm:flex-row sm:justify-center sm:items-start  ">
          {/* {isMobile ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow"
          />
        )} */}
          <DailyExerciseCard date={date} />
        </div>

        <StyledWorkoutPlan
          hasStoredWorkout={hasStoredWorkout}
          workoutName={workoutName}
          days={days}
          currentDayIndex={currentDayIndex}
          exercisesGroupedByDay={exercisesGroupedByDay}
          handlePrevDayClick={handlePrevDayClick}
          handleNextDayClick={handleNextDayClick}
          BuildWorkoutForm={WorkoutPlan}
          onWorkoutSaved={returnDailyWorkouts}
          setHasStoredWorkout={setHasStoredWorkout}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isCreatingWorkout={isCreatingWorkout}
          setExercisesGroupedByDay={setExercisesGroupedByDay}
          workoutId={workoutId}
        />

        {/* <div className="flex flex-row gap-8">
        <div className="flex-1">
        <ChartLine />
        </div>
        <div className="flex-1 ">
          <Card className="h-full  px-6">
          <CardTitle>Last Monday's Workout</CardTitle>
          <div className="mb-6 ">
              <SnapshotTable
                columns={snapshotColumns}
                data={groupedByDay["0"] || []}
                />
                </div>
                </Card>
                </div>
                <div className="flex-1">
                <ChartPie />
        </div>
        </div> */}
      </div>
    </>
  );
}
