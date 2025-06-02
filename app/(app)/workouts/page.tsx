"use client";

import { ChartLine } from "@/components/line-chart";
import { ColumnProps, snapshotColumns } from "./tables/snapshot-columns";
import { SnapshotTable } from "./tables/snapshot-table";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartPie } from "@/components/pie-chart";
import BuildWorkoutForm from "@/components/build-workout-plan-form";
import { useCallback, useEffect, useState } from "react";
import { fetchDailyWorkouts } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useWorkoutContext } from "@/providers/workout-provider";
import { Button } from "@/components/ui/button";
import spinnerBlack from "@/public/spinner-black.svg";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import DisplayDailyWorkoutCard from "@/components/display-daily-workout-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AddDailyExerciseDialog from "@/components/add-daily-exercise-dialog";
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isMobile, setIsMobile] = useState(false);

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
      {/* <div className="flex justify-between items-center p-6 bg-black text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white">Today's Workout</h1>
          <p className="text-gray-300 font-medium">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <AddDailyExerciseDialog date={date} />
      </div> */}
      <div className="container mx-auto py-10 w-11/12">
        <div className="flex flex-col min-h-76 items-start pb-10 sm:flex-row sm:justify-center sm:items-start ">
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
          <DisplayDailyWorkoutCard date={date} />
        </div>

        {/* <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full text-center max-w-mzd ">
          {!hasStoredWorkout && !isLoading && !isCreatingWorkout ? (
            <CardHeader>
              <CardTitle>Build Your Workout</CardTitle>
              <CardDescription>
              No workouts added yet. Click &apos;Add Workout&apos; to get
                started!
                </CardDescription>
                </CardHeader>
                ) : (
            isLoading && (
              <div className="flex justify-center h-80">
              <Image
                  src={spinnerBlack}
                  alt="loading-spinner"
                  className=""
                  priority
                />
              </div>
              )
              )}
              </div>
              </div>
              {isCreatingWorkout && <BuildWorkoutForm />}   */}

        {/* <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full text-center max-w-mzd ">
          {!hasStoredWorkout && !isLoading && !isCreatingWorkout ? (
            <CardHeader>
            <CardTitle>Build Your Workout</CardTitle>
            <CardDescription>
            No workouts added yet. Click &apos;Add Workout&apos; to get
            started!
            </CardDescription>
            </CardHeader>
            ) : (
            isLoading && (
              <div className="flex justify-center h-80">
              <Image
                  src={spinnerBlack}
                  alt="loading-spinner"
                  className=""
                  priority
                  />
              </div>
              )
              )}
              </div>
      </div> */}
        {/* {isCreatingWorkout && <BuildWorkoutForm />} */}
        {/* <BuildWorkoutForm
          onWorkoutSaved={returnDailyWorkouts}
          hasStoredWorkout={hasStoredWorkout}
          setHasStoredWorkout={setHasStoredWorkout}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        /> */}

        {/* {!isCreatingWorkout && hasStoredWorkout && (
          <>
            <h1 className="text-center text-lg font-bold mb-2">
              {workoutName}
            </h1>
            <h2 className="font-bold mb-2 text-center sm:text-left">
              {days[currentDayIndex]}&apos;s Workout
            </h2>
            <div className="mb-6">
              <SnapshotTable
                columns={snapshotColumns}
                data={exercisesGroupedByDay[currentDayIndex] || []}
              />
            </div>
            <div className="flex flex-row justify-between">
              <Button
                onClick={handlePrevDayClick}
                className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
              >
                {"<"}
              </Button>

              <Button
                onClick={handleNextDayClick}
                className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
              >
                {">"}
              </Button>
            </div>
          </>
        )} */}

        <StyledWorkoutPlan
          hasStoredWorkout={hasStoredWorkout}
          workoutName={workoutName}
          days={days}
          currentDayIndex={currentDayIndex}
          exercisesGroupedByDay={exercisesGroupedByDay}
          handlePrevDayClick={handlePrevDayClick}
          handleNextDayClick={handleNextDayClick}
          BuildWorkoutForm={BuildWorkoutForm}
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
