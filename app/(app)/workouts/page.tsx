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
import { useEffect, useState } from "react";
import { fetchDailyWorkouts } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useWorkoutContext } from "@/providers/workout-provider";
import { Button } from "@/components/ui/button";
import spinnerBlack from "@/public/spinner-black.svg";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import BuildDailyWorkoutForm from "@/components/build-daily-workout-form";

interface WorkoutEntry {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function Page() {
  const session = useSupabaseSession();
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const [exercisesGroupedByDay, setExercisesGroupedByDay] = useState<
    Record<number, WorkoutEntry[]>
  >({});
  const [workoutName, setWorkoutName] = useState("");
  const { isCreatingWorkout } = useWorkoutContext();
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

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

  useEffect(() => {
    const returnDailyWorkouts = async () => {
      if (!session) return;

      const data = await fetchDailyWorkouts(session);
      console.log(data);
      if (!data || data.length === 0) {
        setIsLoading(false);
        setHasStoredWorkout(false);
        return;
      }

      setHasStoredWorkout(true);
      setIsLoading(false);

      const dailyExercises = data[0].days;
      setWorkoutName(data[0].name);
      setExercisesGroupedByDay(dailyExercises);
    };
    returnDailyWorkouts();
  }, [session]);

  useEffect(() => {
    const today = new Date().getDay();
    setCurrentDayIndex(today - 1);
  }, []);

  return (
    <div className="container mx-auto py-10 w-11/12">
      <div className="flex flex-col justify-center items-center pb-10 sm:flex-row sm:justify-start ">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow"
        />
        <BuildDailyWorkoutForm date={date} />
      </div>
      <div className="border-t border-gray-200 mb-5" />

      <div className="flex flex-col justify-center items-center w-full">
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
      {isCreatingWorkout && <BuildWorkoutForm />}

      {!isCreatingWorkout && hasStoredWorkout && (
        <>
          <h1 className="text-center text-lg font-bold mb-2">{workoutName}</h1>
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
      )}

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
  );
}
