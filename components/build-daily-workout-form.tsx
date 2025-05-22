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
import { fetchDailyWorkout, uploadExerciseToDB } from "@/lib/workouts";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus } from "lucide-react";

export default function BuildDailyWorkoutForm({ date }) {
  // const [workout, setWorkout] = useState({
  //   exercise: [
  //     {
  //       _uid: nanoid(),
  //       name: "",
  //       set: [{ _uid: nanoid(), weight: "", reps: "" }],
  //     },
  //   ],
  // });

  const [exercise, setExercise] = useState({
    _uid: nanoid(),
    name: "",
    set: [{ _uid: nanoid(), weight: "", reps: "" }],
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
    // setIsCreatingWorkout((prev) => !prev);
  };

  // const addSet = (index) => {
  //   setWorkout((prevWorkout) => {
  //     const updatedExercises = [...prevWorkout.exercise];

  //     const exercise = { ...updatedExercises[index] };

  //     exercise.set = [
  //       ...exercise.set,
  //       { _uid: nanoid(), weight: "", reps: "" },
  //     ];

  //     updatedExercises[index] = exercise;

  //     return {
  //       ...prevWorkout,
  //       exercise: updatedExercises,
  //     };
  //   });
  // };

  const addSet = () => {
    setExercise((prev) => ({
      ...prev,
      set: [...prev.set, { _uid: nanoid(), weight: "", reps: "" }],
    }));
  };

  // const addExercise = () => {
  //   setWorkout((prevWorkout) => ({
  //     ...prevWorkout,
  //     exercise: [
  //       ...prevWorkout.exercise,
  //       {
  //         _uid: nanoid(),
  //         name: "",
  //         set: [{ _uid: nanoid(), weight: "", reps: "" }],
  //       },
  //     ],
  //   }));
  // };

  const uploadWorkout = async () => {
    const data = await uploadExerciseToDB(session, exercise, localDateISO);
    console.log(data);
  };

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      const data = await fetchDailyWorkout(session, localDateISO);
      console.log(data);
      if (data === null) {
        return setHasStoredWorkout(false);
      } else {
        setHasStoredWorkout(true);
      }
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  const handleChange = (value) => {
    setExercise((prevExercise) => ({ ...prevExercise, name: value }));
  };

  const handleWeightChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.set];
      const updatedSetItem = { ...updatedSet[index], weight: value };
      updatedSet[index] = updatedSetItem;

      return { ...prev, set: updatedSet };
    });
  };

  const handleRepChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.set];
      const updatedSetItem = { ...updatedSet[index], reps: value };
      updatedSet[index] = updatedSetItem;

      return {
        ...prev,
        set: updatedSet,
      };
    });
  };

  return (
    <div className="flex w-full justify-center">
      <Dialog>
        {!isCreatingWorkout && !hasStoredWorkout && (
          <div className="flex flex-col justify-center items-center w-full pt-5">
            <p className="pb-2">No exercises completed on this date.</p>
            <DialogTrigger>
              <Button variant="outline" onClick={addWorkout}>
                Add Exercise
              </Button>
            </DialogTrigger>

            <DialogContent className="w-9/12 max-w-xs sm:max-w-md sm:w-auto sm:max-w-none">
              <DialogHeader>
                {/* <DialogTitle>Exercise</DialogTitle> */}
                <DialogTitle>
                  <Input
                    type="text"
                    placeholder="Exercise"
                    className="w-full mt-4"
                    onChange={(e) => handleChange(e.target.value)}
                  />
                </DialogTitle>
              </DialogHeader>
              {exercise.set.map((set, index, exercise) => (
                <div key={set._uid} className="flex items-center space-x-2">
                  <div className="flex flex-row gap-2">
                    <Label className="mr-2">Set {index + 1}</Label>
                    <Input
                      className="max-w-18 mr-2"
                      type="text"
                      placeholder="Weight"
                      onChange={(e) =>
                        handleWeightChange(e.target.value, index)
                      }
                    />
                    <Input
                      className="max-w-18"
                      type="text"
                      placeholder="Reps"
                      onChange={(e) => handleRepChange(e.target.value, index)}
                    />
                  </div>
                  {index + 1 === exercise.length && (
                    <Button onClick={() => addSet()} size="sm" className="px-3">
                      <span className="sr-only">Add Set</span>
                      <Plus />
                    </Button>
                  )}
                </div>
              ))}
              <DialogFooter className="flex flex-row justify-evenly">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <Button onClick={uploadWorkout}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </div>
        )}
      </Dialog>

      {/* {isCreatingWorkout && (
        <div className="flex flex-col h-full max-h-72 overflow-scroll mt-0 md:pl-2 lg:flex-row lg:max-w-md lg:pl-5 lg:overflow-scroll 2xl:max-w-5xl">
          {(workout.exercise || []).map((exercise, index) => (
            <Card key={exercise._uid} className="mt-4 lg:ml-2 overflow-scroll">
              <CardHeader>
                <CardTitle>Exercise {index + 1}</CardTitle>
                <Input
                  type="text"
                  placeholder="Exercise"
                  onChange={(e) => handleChange(index, e.target.value)}
                />
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
      )} */}
    </div>
  );
}
