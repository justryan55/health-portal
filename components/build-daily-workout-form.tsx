import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { fetchDailyWorkout, uploadDailyWorkoutToDB } from "@/lib/workouts";

export default function BuildDailyWorkoutForm({ date }) {
  const [workout, setWorkout] = useState({
    exercise: [
      {
        _uid: nanoid(),
        name: "",
        set: [{ _uid: nanoid(), weight: "", reps: "" }],
      },
    ],
  });

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const currentDate = `${day} / ${month} / ${year}`;

  const addWorkout = () => {
    setIsCreatingWorkout((prev) => !prev);
  };

  const addSet = (index) => {
    setWorkout((prevWorkout) => {
      const updatedExercises = [...prevWorkout.exercise];

      const exercise = { ...updatedExercises[index] };

      exercise.set = [
        ...exercise.set,
        { _uid: nanoid(), weight: "", reps: "" },
      ];

      updatedExercises[index] = exercise;

      return {
        ...prevWorkout,
        exercise: updatedExercises,
      };
    });
  };

  const addExercise = () => {
    setWorkout((prevWorkout) => ({
      ...prevWorkout,
      exercise: [
        ...prevWorkout.exercise,
        {
          _uid: nanoid(),
          name: "",
          set: [{ _uid: nanoid(), weight: "", reps: "" }],
        },
      ],
    }));
  };

  const uploadWorkout = async () => {
    const data = await uploadDailyWorkoutToDB(session, workout, localDateISO);
    console.log(data);
  };

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      const data = await fetchDailyWorkout(session, localDateISO);
      if (data && data.length <= 0) {
        return setHasStoredWorkout(false);
      } else {
        setHasStoredWorkout(true);
      }
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  return (
    <div className="flex w-full justify-center">
      {!isCreatingWorkout && !hasStoredWorkout && (
        <div className="flex flex-col justify-center items-center w-full pt-5">
          <p className="pb-2">No workout completed on this date.</p>
          <Button variant="outline" onClick={addWorkout}>
            Add Workout
          </Button>
        </div>
      )}

      {isCreatingWorkout && (
        <div className="flex flex-col h-full max-h-72 overflow-scroll mt-10 sm:mt-0">
          {(workout.exercise || []).map((exercise, index) => (
            <Card key={exercise._uid} className="mt-4">
              <CardHeader>
                <CardTitle>Exercise {index + 1}</CardTitle>
                <Input type="text" placeholder="Exercise" />
              </CardHeader>
              <CardContent>
                {exercise.set.map((set, index) => (
                  <div
                    key={set._uid}
                    className="flex flex-row items-center pb-1"
                  >
                    <Label className="mr-2">Set {index + 1}</Label>
                    <Input
                      className="max-w-18 mr-2"
                      type="text"
                      placeholder="Weight"
                    />
                    <Input
                      className="max-w-18"
                      type="text"
                      placeholder="Reps"
                    />
                  </div>
                ))}
                <div className="flex flex-row justify-between pt-5">
                  <Button
                    variant="outline"
                    className="h-5"
                    onClick={() => addSet(index)}
                  >
                    + Set
                  </Button>
                  <Button
                    variant="outline"
                    className="h-5"
                    onClick={addExercise}
                  >
                    + Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <CardFooter className="flex justify-center mt-4">
            <Button onClick={uploadWorkout}>Save Workout</Button>
          </CardFooter>
        </div>
      )}
    </div>
  );
}
