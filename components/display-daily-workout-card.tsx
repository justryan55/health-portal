import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { fetchDailyWorkout } from "@/lib/workouts";
import { useDate } from "@/providers/date-provider";
import { Separator } from "./ui/separator";
import AddDailyExerciseDialog from "./add-daily-exercise-dialog";

export default function DisplayDailyWorkoutCard() {
  const [exercises, setExercises] = useState();

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const { date } = useDate();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      const data = await fetchDailyWorkout(session, localDateISO);
      console.log("3", data);
      if (!data) {
        return setHasStoredWorkout(false);
      }

      setHasStoredWorkout(true);
      setExercises(data);
      console.log("HEre", data);
      console.log("date", date);
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  return (
    <div className="w-full">
      {!isCreatingWorkout && !hasStoredWorkout ? (
        <div className="flex flex-col justify-center min-h-72">
          <p className="w-full text-center pb-2">
            No exercises completed on this date.
          </p>
          <AddDailyExerciseDialog date={date} />
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h1 className="pl-5">
            {date.toDateString()}
            {/* Exercises completed on {date.toDateString()} */}
          </h1>
          <AddDailyExerciseDialog date={date} />
        </div>
      )}
      <div className="flex flex-col w-full mt-4 justify-center sm:pl-4 sm:justify-start">
        <div className="max-h-72 overflow-scroll">
          {hasStoredWorkout && (
            <>
              {/* <h1 className="pl-2 pb-2">
                Exercises completed on {date.toDateString()}
              </h1> */}

              {exercises?.map((exercise) => (
                <Card
                  key={nanoid()}
                  className="min-w-full mt-2 flex items-start"
                >
                  <div className="flex flex-row justify-between w-full">
                    <div>
                      <CardHeader className="pr-24 mr-2 whitespace-nowrap">
                        {exercise.name}
                      </CardHeader>
                      <div>
                        <Separator orientation="vertical" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {exercise.sets.map((set, index) => (
                        <CardContent
                          key={index}
                          className="flex flex-row gap-2"
                        >
                          <CardDescription>Set {index + 1}</CardDescription>
                          <CardDescription>Reps: {set.reps}</CardDescription>
                          <CardDescription>
                            Weight: {set.weight}
                          </CardDescription>
                        </CardContent>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
