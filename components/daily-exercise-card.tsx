import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import {
  addSet,
  fetchDailyWorkout,
  updateSet,
  uploadExerciseToDB,
} from "@/lib/workouts";
import { useDate } from "@/providers/date-provider";
import { Plus, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { ComboboxDropdownMenu } from "./combobox-dropdown-menu";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

interface WorkoutSet {
  isNew?: boolean;
  setId: string;
  id: string;
  weight: number;
  reps: number;
}

export default function DailyExerciseCard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exercises, setExercises] = useState<any[] | null>(null);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [isEditing, setIsEditing] = useState<{ bool: boolean; exercise: any }>({
    bool: false,
    exercise: {},
  });
  const [isAddingSet, setIsAddingSet] = useState({
    bool: false,
    exerciseId: "" as string | null,
  });
  const [tempValues, setTempValues] = useState<{
    weight: number | undefined;
    reps: number | undefined;
  }>({
    weight: undefined,
    reps: undefined,
  });

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const { date } = useDate();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  const getExerciseInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      setHasStoredWorkout(false);
      setIsCreatingWorkout(false);
      setExercises(null);

      if (!session) return;
      const data = await fetchDailyWorkout(session, localDateISO);
      console.log("3", data);

      if (!data || data.length === 0) {
        return setHasStoredWorkout(false);
      }

      setHasStoredWorkout(true);
      setExercises(data);
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  // const handleDeleteClick = async (set) => {
  //   const data = await deleteSet(set.setId);
  //   console.log(data);
  //   // re-render
  // };

  const handleEditInput = async (
    set: WorkoutSet,
    field: "weight" | "reps",
    value: string
  ) => {
    const result = await updateSet(set, field, Number(value));

    if (result) {
      setExercises((prev) =>
        (prev ?? []).map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((exerciseSet: WorkoutSet) =>
            exerciseSet.setId === set.setId
              ? { ...exerciseSet, [field]: Number(value) }
              : exerciseSet
          ),
        }))
      );
    }
  };

  const handleAddSet = async (exercise: {
    id: string;
    name: string;
    sets: WorkoutSet[];
  }) => {
    const result = await addSet(exercise, tempValues);
    console.log("result", result);
    if (result?.success) {
      setExercises((prev) =>
        (prev ?? []).map((ex) =>
          ex.id === exercise.id
            ? {
                ...ex,
                sets: [...ex.sets, result.set],
              }
            : ex
        )
      );

      setTempValues({ weight: 0, reps: 0 });
      setIsAddingSet({ bool: false, exerciseId: "" });
    }
  };

  useEffect(() => {
    console.log(isAddingSet);
    console.log(exercises);
    if (!exercises) return;

    if (isAddingSet) {
      setExercises((prev) =>
        (prev ?? []).map((exercise) => {
          if (!isAddingSet.bool) {
            return {
              ...exercise,
              sets: exercise.sets.filter((set: WorkoutSet) => !set.isNew),
            };
          }

          if (exercise.id === isAddingSet.exerciseId) {
            const hasNewSet = exercise.sets.some(
              (set: { isNew: boolean }) => set.isNew
            );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddingSet]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addExercise = async () => {
    setExercises((prev) => [
      ...(prev || []),
      {
        id: nanoid(),
        isNew: true,
        name: "Exercise",
        sets: [{ weight: "", reps: "" }],
      },
    ]);

    setHasStoredWorkout(true);
    setIsCreatingWorkout(true);
  };

  const addSetToNewExercise = (exerciseId: string) => {
    setExercises((prev) =>
      (prev ?? []).map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [...exercise.sets, { id: nanoid(), weight: "", reps: "" }],
          };
        }
        return exercise;
      })
    );
  };

  const handleChange = (id: string, value: string) => {
    setExercises((prev) =>
      (prev ?? []).map((ex) => (ex.id === id ? { ...ex, name: value } : ex))
    );
  };

  const handleNewExerciseSetChange = (
    exerciseId: string,
    setIndex: number,
    field: string,
    value: string
  ) => {
    setExercises((prev) =>
      (prev ?? []).map((exercise) => {
        if (exercise.id === exerciseId) {
          const updatedSets = exercise.sets.map(
            (set: WorkoutSet, index: number) => {
              if (index === setIndex) {
                return { ...set, [field]: value };
              }
              return set;
            }
          );
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    );
  };

  const uploadExercise = async (exercise: {
    id: string;
    name: string;
    sets: WorkoutSet[];
  }) => {
    if (!session) return;
    const data = await uploadExerciseToDB(session, exercise, localDateISO);

    if (data?.success === true) {
      setExercises((prev) =>
        (prev ?? []).map((ex) => {
          if (ex.id === exercise.id) {
            return {
              ...data.exercise,
              isNew: false,
            };
          }
          return ex;
        })
      );

      setIsCreatingWorkout(false);
    }
  };

  const cancelExercise = (exerciseToCancel: { id: string }) => {
    setExercises((prev) =>
      (prev ?? []).filter((ex) => ex.id !== exerciseToCancel.id)
    );
  };

  const cancelNewSet = (exercise: { id: string }) => {
    setTempValues(() => ({ weight: undefined, reps: undefined }));
    setIsAddingSet((prev: { bool: boolean; exerciseId: string | null }) => {
      if (prev.bool && prev.exerciseId === exercise.id) {
        return { bool: false, exerciseId: null };
      }

      return { bool: true, exerciseId: exercise.id };
    });
  };

  const handleSaveEdit = () => {
    setIsEditing({ bool: false, exercise: {} });
  };

  return (
    <div className="w-full ">
      {!isCreatingWorkout && !hasStoredWorkout ? (
        <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 ">
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
            <Button
              onClick={() => addExercise()}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4 inline" />
              Add Exercise
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex ${
            isMobile ? "flex-col gap-2 text-center" : "flex-row"
          } justify-between items-center p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg`}
        >
          <div>
            <h1 className="text-2xl font-bold text-white">
              Today&apos;s Workout
            </h1>
            <p className="text-gray-300 font-medium">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            onClick={() => addExercise()}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4 inline" />
            {!isMobile && <>Add Exercise</>}
          </Button>
        </div>
      )}

      <div className="flex flex-col w-full mt-4 justify-center sm:pl-4 sm:justify-start ">
        <div className="space-y-6">
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
                        {!isMobile ? (
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {getExerciseInitials(exercise.name)}
                          </div>
                        ) : (
                          <span></span>
                        )}
                        {exercise.isNew ? (
                          <Input
                            type="text"
                            placeholder="Exercise"
                            onChange={(e) =>
                              handleChange(exercise.id, e.target.value)
                            }
                            className={`${isMobile && "mr-2"}`}
                          />
                        ) : (
                          <h3 className="text-l font-bold text-gray-800">
                            {exercise.name}
                          </h3>
                        )}
                      </div>

                      {!exercise.isNew &&
                      (!isAddingSet.bool ||
                        isAddingSet.exerciseId !== exercise.id) &&
                      (!isEditing.bool ||
                        isEditing.exercise.id !== exercise.id) ? (
                        <ComboboxDropdownMenu
                          exercise={exercise}
                          setIsEditing={setIsEditing}
                          setIsAddingSet={setIsAddingSet}
                          isAddingSet={isAddingSet}
                          onDeleteExercise={(id) => {
                            setExercises((prev) =>
                              (prev ?? []).filter((ex) => ex.id !== id)
                            );
                          }}
                        />
                      ) : (isAddingSet.bool &&
                          isAddingSet.exerciseId === exercise.id) ||
                        (isEditing.bool &&
                          isEditing.exercise.id === exercise.id) ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (
                                isAddingSet.bool &&
                                isAddingSet.exerciseId === exercise.id
                              ) {
                                cancelNewSet(exercise);
                              } else if (
                                isEditing.bool &&
                                isEditing.exercise.id === exercise.id
                              ) {
                                setIsEditing({ bool: false, exercise: {} });
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className={`${!isMobile && "ml-2"}`}
                          >
                            <X className={`w-4 h-4 ${!isMobile && "mr-2"}`} />
                            {!isMobile && <span>Cancel</span>}
                          </Button>{" "}
                          <Button
                            onClick={() => {
                              if (
                                isAddingSet.bool &&
                                isAddingSet.exerciseId === exercise.id
                              ) {
                                handleAddSet(exercise);
                              } else if (
                                isEditing.bool &&
                                isEditing.exercise.id === exercise.id
                              ) {
                                handleSaveEdit();
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className={`${isMobile && "mr-2"}`}
                          >
                            <Save
                              className={`w-4 h-4 ${!isMobile && "mr-2"}`}
                            />
                            {!isMobile && <span>Save</span>}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => cancelExercise(exercise)}
                            size="sm"
                            variant="outline"
                            className={`${!isMobile && "ml-2"}`}
                          >
                            <X className={`w-4 h-4 ${!isMobile && "mr-2"}`} />
                            {!isMobile && <span>Cancel</span>}
                          </Button>{" "}
                          <Button
                            onClick={() => uploadExercise(exercise)}
                            size="sm"
                            variant="outline"
                            className={`${isMobile && "mr-2"}`}
                          >
                            <Save
                              className={`w-4 h-4 ${!isMobile && "mr-2"}`}
                            />
                            {!isMobile && <span>Save</span>}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-[0.5fr_1fr_1fr] gap-3 text-center items-center p-3  bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Set
                      </div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Weight
                      </div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Reps
                      </div>
                    </div>
                    {exercise.sets.map(
                      (set: WorkoutSet, index: number, array: WorkoutSet[]) => (
                        <>
                          <div
                            key={set.id}
                            className="grid grid-cols-[0.5fr_1fr_1fr] gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors mb-0"
                          >
                            <div className="text-center">
                              {/* {!isMobile && (
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                Set
                              </div>
                            )} */}
                              <div className="text-md font-bold text-gray-800">
                                {/* {`${isMobile ? "S" : ""}`} */}
                                {index + 1}
                              </div>
                            </div>
                            <div className="text-center">
                              {/* {!isMobile && (
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                Weight
                              </div>
                            )} */}
                              {exercise.isNew ||
                              (isEditing.bool &&
                                isEditing.exercise.id === exercise.id) ? (
                                <div className="flex justify-center">
                                  <Input
                                    placeholder={String(set.weight) || "Weight"}
                                    className="text-center max-w-30 "
                                    onChange={(e) =>
                                      exercise.isNew
                                        ? handleNewExerciseSetChange(
                                            exercise.id,
                                            index,
                                            "weight",
                                            e.target.value
                                          )
                                        : handleEditInput(
                                            set,
                                            "weight",
                                            e.target.value
                                          )
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
                                    value={tempValues.weight}
                                    onChange={(e) =>
                                      setTempValues((prev) => ({
                                        ...prev,
                                        weight: Number(e.target.value),
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
                              {/* {!isMobile && (
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                Reps
                              </div>
                            )} */}
                              {exercise.isNew ||
                              (isEditing.bool &&
                                isEditing.exercise.id === exercise.id) ? (
                                <div className="flex justify-center">
                                  <Input
                                    placeholder={String(set.reps) || "Reps"}
                                    className="text-center max-w-30"
                                    onChange={(e) =>
                                      exercise.isNew
                                        ? handleNewExerciseSetChange(
                                            exercise.id,
                                            index,
                                            "reps",
                                            e.target.value
                                          )
                                        : handleEditInput(
                                            set,
                                            "reps",
                                            e.target.value
                                          )
                                    }
                                  />
                                </div>
                              ) : isAddingSet.bool &&
                                isAddingSet.exerciseId === exercise.id &&
                                String(set.weight) === "" &&
                                String(set.reps) === "" ? (
                                <div className="flex justify-center">
                                  <Input
                                    placeholder="Reps"
                                    className="text-center max-w-30"
                                    value={tempValues.reps}
                                    onChange={(e) =>
                                      setTempValues((prev) => ({
                                        ...prev,
                                        reps: Number(e.target.value),
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
                            {/* {isAddingSet.bool &&
                            index + 1 === array.length &&
                            isAddingSet.exerciseId === exercise.id && (
                              <Button
                                onClick={() => handleAddSet(exercise)}
                                size="sm"
                                className="px-3 max-w-max"
                                variant="outline"
                              >
                                <span className="sr-only">Add Set</span>
                                <Save />
                              </Button>
                            )} */}
                            {/* <div className="col-span-3 flex items-center justify-center w-full">
                            {exercise.isNew && index + 1 === array.length && (
                              <div className="flex flex-col w-full">
                                <Separator className="w-full mb-2" />
                                <div className="flex justify-center items-center w-full pb-3">
                                  <Button
                                    onClick={() =>
                                      addSetToNewExercise(exercise.id)
                                    }
                                    size="sm"
                                    className="px-3 max-w-max"
                                    variant="outline"
                                  >
                                    <span className="sr-only">Add Set</span>
                                    <Plus />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div> */}
                          </div>
                          <div className="col-span-3 flex items-center justify-center w-full">
                            {exercise.isNew && index + 1 === array.length && (
                              <div className="flex flex-col w-full mt-2">
                                <Separator className="w-full mb-2" />
                                <div className="flex justify-center items-center w-full pb-3">
                                  <Button
                                    onClick={() =>
                                      addSetToNewExercise(exercise.id)
                                    }
                                    size="sm"
                                    className="px-3 max-w-max"
                                    variant="outline"
                                  >
                                    <span className="sr-only">Add Set</span>
                                    <Plus />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    )}
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
