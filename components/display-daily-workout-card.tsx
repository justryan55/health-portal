import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import {
  addSet,
  deleteSet,
  fetchDailyWorkout,
  updateSet,
} from "@/lib/workouts";
import { useDate } from "@/providers/date-provider";
import { Separator } from "./ui/separator";
import AddDailyExerciseDialog from "./add-daily-exercise-dialog";
import { Check, MoreHorizontal, Save, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { ComboboxDropdownMenu } from "./combobox-dropdown-menu";
import { Input } from "./ui/input";

export default function DisplayDailyWorkoutCard() {
  const [exercises, setExercises] = useState();
  const [isEditing, setIsEditing] = useState({ bool: false, exercise: "" });
  const [isAddingSet, setIsAddingSet] = useState({
    bool: false,
    exerciseId: "",
  });
  const [tempValues, setTempValues] = useState<{
    weight: string;
    reps: string;
  }>({ weight: "", reps: "" });

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const { date } = useDate();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  const getExerciseInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      const data = await fetchDailyWorkout(session, localDateISO);
      console.log("3", data);

      if (!data) {
        return setHasStoredWorkout(false);
      }

      setHasStoredWorkout(true);
      setExercises(data);
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  const handleDeleteClick = async (set) => {
    const data = await deleteSet(set.setId);
    // re-render
  };

  const handleEditInput = async (set, field, value) => {
    const data = await updateSet(set, field, value);

    // re-render
  };

  const handleAddSet = async (exercise) => {
    const data = await addSet(exercise, tempValues);
    console.log(data);
  };

  useEffect(() => {
    console.log(isAddingSet);
    console.log(exercises);
    if (!exercises) return;

    if (isAddingSet) {
      setExercises((prev) =>
        prev.map((exercise, index) => {
          if (!isAddingSet.bool) {
            return {
              ...exercise,
              sets: exercise.sets.filter((set) => !set.isNew),
            };
          }

          if (exercise.id === isAddingSet.exerciseId) {
            const hasNewSet = exercise.sets.some((set) => set.isNew);
            if (hasNewSet) return exercise;

            return {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  setId: nanoid(),
                  weight: "",
                  reps: "",
                  isNew: true,
                },
              ],
            };
          }
          return exercise;
        })
      );
    }
  }, [isAddingSet]);

  useEffect(() => {
    console.log(tempValues);
  }, [tempValues]);

  return (
    <div className="w-full">
      {!isCreatingWorkout && !hasStoredWorkout ? (
        // <div className="flex flex-col justify-center min-h-72">
        //   <p className="w-full text-center pb-2">
        //     No exercises completed on this date.
        //   </p>
        //   <AddDailyExerciseDialog date={date} />
        // </div>

        <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-center space-y-4">
            {/* <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div> */}
            <p className="text-gray-600 font-medium">
              No exercises completed on this date.
            </p>
            <p className="text-gray-500 text-sm">
              Start your workout by adding your first exercise!
            </p>
            <AddDailyExerciseDialog date={date} />
          </div>
        </div>
      ) : (
        // <div className="flex justify-between items-center">
        //   <h1 className="pl-5">
        //     {date.toDateString()}
        //     {/* Exercises completed on {date.toDateString()} */}
        //   </h1>
        //   <AddDailyExerciseDialog date={date} />
        // </div>

        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg">
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
        </div>
      )}

      <div className="flex flex-col w-full mt-4 justify-center sm:pl-4 sm:justify-start">
        <div className="space-y-6">
          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasStoredWorkout &&
              exercises?.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-black" />

                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {getExerciseInitials(exercise.name)}
                        </div>
                        <h3 className="text-l font-bold text-gray-800">
                          {exercise.name}
                        </h3>
                      </div>
                      {/* Options menu */}
                      {/* <MoreHorizontal className="w-5 h-5 text-gray-400" /> */}
                      <ComboboxDropdownMenu
                        exercise={exercise}
                        setIsEditing={setIsEditing}
                        setIsAddingSet={setIsAddingSet}
                        isAddingSet={isAddingSet}
                      />
                    </div>
                    {/* <Separator orientation="horizontal" /> */}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {exercise.sets.map((set, index) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-[60px_1fr_1fr_40px] gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-center">
                          <span className="inline-block bg-white text-gray-600 font-semibold text-sm px-3 py-1 rounded-lg">
                            Set {index + 1}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                            Weight
                          </div>
                          {isEditing.bool &&
                          isEditing.exercise.id === exercise.id ? (
                            <div className="flex justify-center">
                              <Input
                                placeholder={set.weight}
                                className="text-center max-w-30"
                                onChange={(e) =>
                                  handleEditInput(set, "weight", e.target.value)
                                }
                              />
                            </div>
                          ) : isAddingSet.bool &&
                            isAddingSet.exerciseId === exercise.id &&
                            set.isNew ? (
                            <div className="flex justify-center">
                              <Input
                                placeholder="Weight"
                                className="text-center max-w-30"
                                // value={tempValues.weight}
                                // onBlur={(e) =>
                                //   handleAddSet(
                                //     exercise,
                                //     "weight",
                                //     e.target.value
                                //   )
                                // }
                                value={tempValues.weight}
                                onChange={(e) =>
                                  setTempValues((prev) => ({
                                    ...prev,
                                    weight: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          ) : (
                            <div className="text-md font-bold text-gray-800">
                              {set.weight}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                            Reps
                          </div>
                          {isEditing.bool &&
                          isEditing.exercise.id === exercise.id ? (
                            <div className="flex justify-center">
                              <Input
                                placeholder={set.reps}
                                className="text-center max-w-30"
                                onChange={(e) =>
                                  handleEditInput(set, "reps", e.target.value)
                                }
                              />
                            </div>
                          ) : isAddingSet.bool &&
                            isAddingSet.exerciseId === exercise.id &&
                            set.weight === "" &&
                            set.reps === "" ? (
                            <div className="flex justify-center">
                              <Input
                                placeholder="Weight"
                                className="text-center max-w-30"
                                // value={set.weight}
                                // onBlur={(e) =>
                                //   handleAddSet(exercise, "reps", e.target.value)
                                // }
                                value={tempValues.reps}
                                onChange={(e) =>
                                  setTempValues((prev) => ({
                                    ...prev,
                                    reps: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          ) : (
                            <div className="text-md font-bold text-gray-800">
                              {set.reps}
                            </div>
                          )}
                        </div>

                        {isAddingSet.bool &&
                          isAddingSet.exerciseId === exercise.id &&
                          set.isNew && (
                            <Button onClick={() => handleAddSet(exercise)}>
                              <Save />
                            </Button>
                          )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}{" "}
          </div>
          {!hasStoredWorkout && (
            <div className="border-t border-gray-200 mb-5" />
          )}
        </div>
      </div>
    </div>
  );
}
