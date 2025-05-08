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
import BuildWorkoutForm from "@/components/build-workout-form";
import { useEffect, useState } from "react";
import { fetchWorkoutDay, fetchWorkouts } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useWorkoutContext } from "@/providers/workout-provider";
import { Button } from "@/components/ui/button";

export default function Page() {
  const session = useSupabaseSession();
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [groupedByDay, setGroupedByDay] = useState({});
  const { isCreatingWorkout, setIsCreatingWorkout } = useWorkoutContext();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const nextDay = () => {
    setDayIndex((prev) => (prev + 1) % days.length);
  };

  const prevDay = () => {
    setDayIndex((prev) => (prev - 1 + days.length) % days.length);
  };

  useEffect(() => {
    const returnWorkouts = async () => {
      const fetchIfWorkouts = await fetchWorkouts(session);
      if (!fetchIfWorkouts) return;
      setHasStoredWorkout(fetchIfWorkouts.length > 0);
    };
    returnWorkouts();
  }, [session]);

  useEffect(() => {
    const returnWorkoutDays = async () => {
      const data = await fetchWorkoutDay(session);
      if (!data) return;

      const grouped = {};

      data.forEach((item) => {
        const day = item.workout_day.day_of_the_week;

        if (!grouped[day]) {
          grouped[day] = [];
        }

        grouped[day].push({
          exercise: item.exercise_name,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
        });
      });

      setGroupedByDay(grouped);
    };
    returnWorkoutDays();
  }, [session]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full text-center max-w-mzd">
          {!hasStoredWorkout && !isCreatingWorkout && (
            <CardHeader>
              <CardTitle>Build Your Workout</CardTitle>
              <CardDescription>
                No workouts added yet. Click 'Add Workout' to get started!
              </CardDescription>
            </CardHeader>
          )}
        </div>
      </div>
      {isCreatingWorkout && <BuildWorkoutForm />}

      {!isCreatingWorkout && (
        <>
          <h1 className="font-bold mb-2">{days[dayIndex]}'s Workout</h1>
          <div className="mb-6">
            <SnapshotTable
              columns={snapshotColumns}
              data={groupedByDay[dayIndex] || []}
            />
          </div>
          <div className="flex flex-row justify-between">
            <Button
              onClick={prevDay}
              className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
            >
              {"<"}
            </Button>

            <Button
              onClick={nextDay}
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
