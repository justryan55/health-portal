"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { uploadWorkoutPlanToDB } from "@/lib/workouts";
import { useWorkoutContext } from "@/providers/workout-provider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, ChevronRight, ChevronLeft, Trash2, Save, X } from "lucide-react";
import { Input } from "./ui/input";
import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import Image from "next/image";
import spinnerBlack from "@/public/spinner-black.svg";
import { useDate } from "@/providers/date-provider";
import { Separator } from "./ui/separator";

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
  const { setIsCreatingWorkout } = useWorkoutContext();

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

  return (
    <>
      {!hasStoredWorkout && !isLoading ? (
        <Dialog>
          <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-gray-600 font-medium">
                No workout plan added yet.
              </p>
              <p className="text-gray-500 text-sm">
                Start your workout by adding your first exercise!
              </p>
              <DialogTrigger>
                <Button variant="outline">Add Workout Plan</Button>
              </DialogTrigger>
            </div>
          </div>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden bg-white rounded-2xl border-0 shadow-2xl md:max-w-3xl">
            <DialogHeader className="space-y-6 p-6 pt-1 md:p-6 text-black rounded-t-2xl  pb-0 md:pb-0">
              <div className="space-y-2">
                <Input
                  type="text"
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter your workout name..."
                  className="text-center font-semibold text-sm md:text-xl"
                />
              </div>

              <CardContent className="p-0 md:p-4 md:pb-0 ">
                <div className="flex justify-between items-center">
                  <Button onClick={prevDay} variant="ghost">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-black">
                      {days[day]}
                    </h3>
                    <p className="text-black/80 text-sm">Day {day + 1} of 7</p>
                  </div>

                  <Button onClick={nextDay} variant="ghost">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </DialogHeader>
            <Separator orientation="horizontal" />

            <div className="p-6 overflow-y-auto max-h-[50vh] pt-0">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">
                    Exercises
                  </h4>
                </div>

                <div className="space-y-4">
                  {(exercisesByDay[day] || []).map((row, index, exercise) => (
                    <Card
                      key={row.id}
                      className="border border-gray-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden p-0 border-none pt-0 pb-0 shadow-none"
                    >
                      <CardContent className="p-4 pt-0 pb-4 md:pb-1">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                              Exercise
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., Bench Press"
                              value={row.exercise !== null ? row.exercise : ""}
                              onChange={(e) =>
                                handleExerciseInputChange(
                                  index,
                                  "exercise",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400 "
                            />
                          </div>

                          <div className="flex gap-2 items-end col-span-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                                Sets
                              </label>
                              <Input
                                type="numeric"
                                placeholder="3"
                                value={row.sets !== null ? row.sets : ""}
                                onChange={(e) =>
                                  handleExerciseInputChange(
                                    index,
                                    "sets",
                                    e.target.value
                                  )
                                }
                                className="rounded-lg border-gray-200 max-w-full"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                                Reps
                              </label>
                              <Input
                                type="numeric"
                                placeholder="10"
                                value={row.reps !== null ? row.reps : ""}
                                onChange={(e) =>
                                  handleExerciseInputChange(
                                    index,
                                    "reps",
                                    e.target.value
                                  )
                                }
                                className="rounded-lg border-gray-200 max-w-full"
                              />
                            </div>
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                                  Weight
                                </label>
                                <Input
                                  placeholder="135"
                                  type="numeric"
                                  value={row.weight !== null ? row.weight : ""}
                                  onChange={(e) =>
                                    handleExerciseInputChange(
                                      index,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className="rounded-lg border-gray-200 max-w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between sm:justify-auto">
                            <div>
                              {(exercisesByDay[day] || []).length > 1 ? (
                                <Button
                                  onClick={() => handleDeleteClick(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2"
                                >
                                  <Trash2 className="w-4 h-4  sm:mr-2" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={addRow}
                                  size="sm"
                                  className="px-3 max-w-max"
                                >
                                  <span className="sr-only">Add Set</span>
                                  <Plus />
                                </Button>
                              )}
                            </div>
                            {index + 1 === exercise.length &&
                              (exercisesByDay[day] || []).length > 1 && (
                                <Button
                                  onClick={addRow}
                                  size="sm"
                                  className="px-3 max-w-max"
                                >
                                  <span className="sr-only">Add Set</span>
                                  <Plus />
                                </Button>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty state for exercises */}
                {/* {(exercisesByDay[day] || []).length === 0 && (
                  <Card className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No exercises added for {days[day]}
                    </p>
                    <Button
                      onClick={addRow}
                      variant="outline"
                      className="rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Exercise
                    </Button>
                  </Card>
                )} */}
              </div>
            </div>

            <DialogFooter className="p-6">
              <div className="flex justify-between w-full gap-4">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl px-6 py-2 font-medium border-gray-200 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleSaveClick}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
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
