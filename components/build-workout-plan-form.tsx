"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { fetchDailyWorkouts, uploadWorkoutPlanToDB } from "@/lib/workouts";
import { useWorkoutContext } from "@/providers/workout-provider";
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
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "./ui/input";
import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import Image from "next/image";
import spinnerBlack from "@/public/spinner-black.svg";

interface Exercise {
  id: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
}

type ExercisesByDayProps = {
  [day: number]: Exercise[];
};

export default function BuildWorkoutForm({
  onWorkoutSaved,
  hasStoredWorkout,
  setHasStoredWorkout,
  isLoading,
  setIsLoading,
}) {
  const session = useSupabaseSession();
  const { setIsCreatingWorkout } = useWorkoutContext();
  // const [isLoading, setIsLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState("");
  // const [hasStoredWorkout, setHasStoredWorkout] = useState(false);

  const [exercisesByDay, setExercisesByDay] = useState<ExercisesByDayProps>({
    0: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    1: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    2: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    3: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    4: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    5: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    6: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
  });

  const [workoutPlan, setWorkoutPlan] = useState({
    workoutName: "",
    exercises: exercisesByDay,
  });

  const [day, setDay] = useState(0);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleExerciseInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [...dayExercises];
    updatedExercises[index][field] = value;

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });

    setWorkoutPlan({ ...workoutPlan, exercises: exercisesByDay });
  };

  const handleTitleChange = (value: string) => {
    setWorkoutPlan((prev) => ({ ...prev, workoutName: value }));
  };

  const addRow = () => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [
      ...dayExercises,
      { exercise: "", sets: "", reps: "", weight: "" },
    ];

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });
  };

  const nextDay = () => {
    setDay((prevDay) => (prevDay + 1) % days.length);
  };

  const prevDay = () => {
    setDay((prevDay) => (prevDay - 1 + days.length) % days.length);
  };

  const handleSaveClick = async () => {
    const { data, error } = await uploadWorkoutPlanToDB(workoutPlan);

    if (!error) {
      setHasStoredWorkout(true);
      onWorkoutSaved();
    }

    setIsCreatingWorkout((prev: boolean) => !prev);
  };

  const handleDeleteClick = (index: number) => {
    const dayExercises = exercisesByDay[day] || [];

    dayExercises.splice(index, 1);

    setExercisesByDay({
      ...exercisesByDay,
      [day]: [...dayExercises],
    });
  };

  // useEffect(() => {
  //   const returnDailyWorkouts = async () => {
  //     if (!session || !session.user) return;

  //     const data = await fetchDailyWorkouts(session);

  //     if (!data || data.length === 0) {
  //       setIsLoading(false);
  //       setHasStoredWorkout(false);
  //       return;
  //     }

  //     setHasStoredWorkout(true);
  //     setIsLoading(false);

  //     const dailyExercises = data[0].days;
  //     setWorkoutName(data[0].name);
  //     setExercisesGroupedByDay(dailyExercises);
  //   };
  //   returnDailyWorkouts();
  // }, [session]);

  return (
    <>
      {!hasStoredWorkout && !isLoading ? (
        <Dialog>
          <div className="flex flex-col h-full justify-center items-center">
            <p className="pb-2">No workout plans added yet.</p>
            <DialogTrigger>
              <Button variant="outline">Add Workout Plan</Button>
            </DialogTrigger>
          </div>

          <DialogContent className="w-9/12 max-w-xs sm:max-w-md sm:w-auto sm:max-w-none">
            <DialogHeader>
              {/* <DialogTitle>Exercise</DialogTitle> */}
              <DialogTitle>
                <div className="flex justify-center items-center py-5">
                  <Input
                    type="text"
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Workout Name"
                    className="border px-2 py-1 text-center font-bold"
                  />
                </div>
              </DialogTitle>
              <div className="flex flex-row justify-between items-center">
                <Button
                  onClick={prevDay}
                  className="px-4 bg-white text-black border-2 hover:text-white"
                >
                  <ChevronLeft />
                </Button>
                <DialogTitle>{days[day]}</DialogTitle>
                <Button
                  onClick={nextDay}
                  className="px-4 bg-white text-black border-2 hover:text-white"
                >
                  <ChevronRight />
                </Button>
              </div>
              <DialogDescription>
                Add your exercises for {days[day]}.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-x-auto">
              <div className="min-w-full table-auto">
                <div>
                  {(exercisesByDay[day] || []).map((row, index, exercise) => (
                    <div key={row.id} className="flex flex-row gap-2 my-2">
                      <Input
                        className="max-w-30 mr-2"
                        type="text"
                        placeholder="Exercise"
                        value={row.exercise !== null ? row.exercise : ""}
                        onChange={(e) =>
                          handleExerciseInputChange(
                            index,
                            "exercise",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        className="max-w-18 mr-2"
                        type="numeric"
                        placeholder="Sets"
                        value={row.sets !== null ? row.sets : ""}
                        onChange={(e) =>
                          handleExerciseInputChange(
                            index,
                            "sets",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        className="max-w-18"
                        type="numeric"
                        placeholder="Reps"
                        value={row.reps !== null ? row.reps : ""}
                        onChange={(e) =>
                          handleExerciseInputChange(
                            index,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        className="max-w-18 mr-2"
                        placeholder="Weight"
                        type="numeric"
                        value={row.weight !== null ? row.weight : ""}
                        onChange={(e) =>
                          handleExerciseInputChange(
                            index,
                            "weight",
                            e.target.value
                          )
                        }
                      />
                      {index + 1 === exercise.length && (
                        <Button
                          onClick={() => addRow()}
                          size="sm"
                          className="px-3"
                        >
                          <span className="sr-only">Add Set</span>
                          <Plus />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-evenly">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button onClick={handleSaveClick}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    </>
  );
}
