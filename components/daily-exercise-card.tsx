import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import {
  addSet,
  deleteWorkout,
  fetchDailyWorkout,
  fetchWeeklyPlan,
  updateSet,
  uploadExerciseToDB,
} from "@/lib/workouts";
import { useDate } from "@/providers/date-provider";
import { FilePlus2, Plus, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { ComboboxDropdownMenu } from "./combobox-dropdown-menu";
import { Input } from "./ui/input";
import spinnerBlack from "@/public/spinner-black.svg";
import Image from "next/image";
import { ExerciseAutocompleteInput } from "./exercise-autocomplete-input";
import { DynamicSlider } from "../components/dynamic-slider";
import TimerComponent from "./timer-component";
import { toast } from "sonner";

interface WorkoutSet {
  isNew?: boolean;
  setId: string;
  id: string;
  weight: number;
  reps: number;
  rpe: number;
}

interface ActiveSlider {
  type: "weight" | "reps" | "rpe";
  exerciseId: string;
  setIndex: number;
}

interface DailyExerciseCardProps {
  activeSlider: ActiveSlider | null;
  setActiveSlider: React.Dispatch<React.SetStateAction<ActiveSlider | null>>;
}

export default function DailyExerciseCard({
  activeSlider,
  setActiveSlider,
}: DailyExerciseCardProps) {
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
    rpe: number | undefined;
  }>({
    weight: undefined,
    reps: undefined,
    rpe: 5,
  });

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const { date } = useDate();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();
  const [isLoading, setIsLoading] = useState(false);
  const [, setTimerIsShowing] = useState(false);
  // const [progress, setProgress] = useState([5]);

  const getExerciseInitials = (name: string) => {
    if (!name) return;
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    setIsLoading(true);
    const checkIfWorkoutForDate = async () => {
      setHasStoredWorkout(false);
      setIsCreatingWorkout(false);
      setExercises(null);

      if (!session) return;
      const data = await fetchDailyWorkout(session, localDateISO);

      if (!data || data.length === 0) {
        setIsLoading(false);
        if (!data) {
          toast.error("Unable to fetch daily workout.");
        }
        return setHasStoredWorkout(false);
      }
      setIsLoading(false);
      setHasStoredWorkout(true);
      setExercises(data);
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  const handleEditInput = async (
    set: WorkoutSet,
    field: "weight" | "reps" | "rpe",
    value: string | number
  ) => {
    const numeric =
      value === ""
        ? undefined
        : typeof value === "number"
        ? value
        : Number(value);

    if (numeric === undefined || isNaN(numeric)) {
      return;
    }

    const result = await updateSet(set, field, numeric);

    if (result) {
      setExercises((prev) =>
        (prev ?? []).map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((exerciseSet: WorkoutSet) =>
            exerciseSet.setId === set.setId
              ? { ...exerciseSet, [field]: numeric }
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

    if (result?.success) {
      setExercises((prev) =>
        (prev ?? []).map((ex) =>
          ex.id === exercise.id
            ? {
                ...ex,
                sets: [...ex.sets, { ...result.set, rpe: tempValues.rpe ?? 5 }],
              }
            : ex
        )
      );

      setTempValues({ weight: undefined, reps: undefined, rpe: 5 });
      setIsAddingSet({ bool: false, exerciseId: "" });
      setActiveSlider(null);
    }
  };

  useEffect(() => {
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
                  rpe: tempValues.rpe ?? 5,
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
  }, [isAddingSet, tempValues.rpe]);

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
      {
        id: nanoid(),
        isNew: true,
        name: "Exercise",
        sets: [{ weight: "", reps: "" }],
      },
      ...(prev || []),
    ]);

    setHasStoredWorkout(true);
    setIsCreatingWorkout(true);
  };

  useEffect(() => {
    if (hasStoredWorkout && exercises && exercises.length === 0) {
      const cleanupWorkout = async () => {
        if (!session) return;

        const result = await deleteWorkout(localDateISO);

        if (result?.success) {
          setHasStoredWorkout(false);
          setIsCreatingWorkout(false);
        }
      };

      cleanupWorkout();
    }
  }, [exercises, hasStoredWorkout, session, localDateISO]);

  const quickAddExercises = async () => {
    if (!session) return;
    const res = await fetchWeeklyPlan(session);
    const weeklyExercises = res?.[0].days;
    const dayIndex = (date.getDay() + 6) % 7;
    const dailyExercises = weeklyExercises?.[dayIndex];

    if (!dailyExercises || dailyExercises.length === 0) return;

    const transformed = dailyExercises.map((exercise) => ({
      id: nanoid(),
      isNew: true,
      name: exercise.exercise_name || "Exercise",
      libraryId: exercise.exercise_library_id || "",
      sets: Array.from({ length: exercise.sets || 1 }).map(() => ({
        weight: String(exercise.weight ?? ""),
        reps: String(exercise.reps ?? ""),
      })),
    }));

    setExercises((prev) => [...(prev || []), ...transformed]);
  };

  const addSetToNewExercise = (exerciseId: string) => {
    setActiveSlider(null);

    setTimerIsShowing(false);
    setExercises((prev) =>
      (prev ?? []).map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: nanoid(),
                weight: tempValues.weight ?? "",
                reps: tempValues.reps ?? "",
                rpe: tempValues.rpe ?? 5,
                isNew: true,
              },
            ],
          };
        }
        return exercise;
      })
    );
  };

  const handleChange = (id: string, value: { name: string; id: string }) => {
    setExercises((prev) =>
      (prev ?? []).map((ex) =>
        ex.id === id ? { ...ex, name: value.name, libraryId: value.id } : ex
      )
    );
  };

  const handleNewExerciseSetChange = (
    exerciseId: string,
    setIndex: number,
    field: string,
    value: string
  ) => {
    const numeric = value === "" ? undefined : Number(value);

    if (numeric === undefined || isNaN(numeric)) {
      return;
    }

    setExercises((prev) =>
      (prev ?? []).map((exercise) => {
        if (exercise.id === exerciseId) {
          const updatedSets = exercise.sets.map(
            (set: WorkoutSet, index: number) => {
              if (index === setIndex) {
                return { ...set, [field]: numeric };
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
    isNew: boolean;
    name: string;
    sets: WorkoutSet[];
    libraryId?: string;
  }) => {
    if (!session) return;

    const exerciseToUpload = exercise.isNew
      ? {
          ...exercise,
          libraryId: exercise.libraryId ?? "",
          sets: exercise.sets.map((set) => ({
            ...set,
            rpe: Number(set.rpe ?? 5),
          })),
        }
      : {
          ...exercise,
          libraryId: exercise.libraryId ?? "",
        };

    const data = await uploadExerciseToDB(
      session,
      exerciseToUpload,
      localDateISO
    );

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
    setActiveSlider(null);
  };

  const cancelLastSet = (exercise: { id: string; sets: WorkoutSet[] }) => {
    setTimerIsShowing(false);
    setExercises((prev) =>
      (prev ?? [])
        .filter((ex) => {
          if (ex.id === exercise.id) {
            return ex.sets.length > 1;
          }
          return true;
        })
        .map((ex) => {
          if (ex.id === exercise.id) {
            return {
              ...ex,
              sets: ex.sets.slice(0, -1),
            };
          }
          return ex;
        })
    );
  };

  const cancelNewSet = (exercise: { id: string }) => {
    setTempValues(() => ({
      weight: undefined,
      reps: undefined,
      rpe: 5,
    }));
    setIsAddingSet((prev: { bool: boolean; exerciseId: string | null }) => {
      if (prev.bool && prev.exerciseId === exercise.id) {
        return { bool: false, exerciseId: null };
      }

      return { bool: true, exerciseId: exercise.id };
    });
    setActiveSlider(null);
  };

  const handleSaveEdit = () => {
    setIsEditing({ bool: false, exercise: {} });
    setActiveSlider(null);
  };

  // const handleRpeChange = (
  //   newRpe: number,
  //   exercise: { id: string },
  //   index: number
  // ) => {
  //   setExercises((prev) =>
  //     (prev ?? []).map((ex) => {
  //       if (ex.id === exercise.id) {
  //         return {
  //           ...ex,
  //           sets: ex.sets.map((s: WorkoutSet, i: number) =>
  //             i === index ? { ...s, rpe: newRpe } : s
  //           ),
  //         };
  //       }
  //       return ex;
  //     })
  //   );
  // };

  if (isLoading) {
    return (
      <div className="flex w-full justify-center items-center min-h-[320px] bg-white rounded-2xl border border-gray-100">
        <Image src={spinnerBlack} alt="loading-spinner" className="" priority />
      </div>
    );
  }

  return (
    <div className="w-full ">
      {!isCreatingWorkout && !hasStoredWorkout ? (
        <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 ">
          <div className="text-center space-y-4">
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
          <div className="flex flex-row">
            <div className="flex flex-col">
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
            {/* {isMobile && (
              <div className="flex justify-center items-center pl-4">
                <TimerComponent />
              </div>
            )} */}
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
            <TimerComponent />

            <Button
              onClick={() => quickAddExercises()}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full md:w-auto justify-self-center md:col-auto"
            >
              <FilePlus2 className="w-4 h-4 inline" />
              Quick Add
            </Button>
            <Button
              onClick={() => addExercise()}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full md:w-auto col-span-2 "
            >
              <Plus className="w-4 h-4 inline" />
              Add Exercise
            </Button>
          </div>
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
                        {/* {!isMobile ? ( */}
                        <div className="w-10 h-10 min-w-[40px] bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {getExerciseInitials(exercise.name)}
                        </div>
                        {/* ) : (
                          <span></span>
                        )} */}
                        {exercise.isNew ? (
                          <ExerciseAutocompleteInput
                            exercise={exercise}
                            handleChange={handleChange}
                            isMobile={isMobile ?? false}
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
                            setExercises((prev) => {
                              const updatedExercises = (prev ?? []).filter(
                                (ex) => ex.id !== id
                              );
                              return updatedExercises;
                            });
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
                            disabled={
                              !exercise.name?.trim() ||
                              !exercise.sets.length ||
                              exercise.sets.some(
                                (set: WorkoutSet) =>
                                  set.weight == null ||
                                  set.weight < 0 ||
                                  !set.reps ||
                                  set.reps < 1
                              )
                            }
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
                    <div className="grid grid-cols-[0.25fr_1fr_1fr_1fr]  gap-3 text-center items-center p-3  bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Set
                      </div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Weight
                      </div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Reps
                      </div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Rpe
                      </div>
                    </div>
                    {exercise.sets.map(
                      (set: WorkoutSet, index: number, array: WorkoutSet[]) => (
                        <div key={set.setId}>
                          <div className="grid grid-cols-[0.25fr_1fr_1fr_1fr] gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors mb-0">
                            <div className="text-center">
                              <div className="text-md font-bold text-gray-800">
                                {index + 1}
                              </div>
                            </div>
                            <div className="text-center">
                              {exercise.isNew ||
                              (isEditing.bool &&
                                isEditing.exercise.id === exercise.id) ? (
                                <div className="flex justify-center">
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "weight",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={0}
                                    value={set.weight ?? ""}
                                    placeholder="Weight"
                                    className="text-center max-w-30 bg-white"
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
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "weight",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={0}
                                    value={tempValues.weight ?? ""}
                                    placeholder="Weight"
                                    className="text-center max-w-30 bg-white"
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
                              {exercise.isNew ||
                              (isEditing.bool &&
                                isEditing.exercise.id === exercise.id) ? (
                                <div className="flex justify-center">
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "reps",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={0}
                                    value={set.reps ?? ""}
                                    placeholder="Reps"
                                    className="text-center max-w-30 bg-white"
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
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "reps",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={0}
                                    value={tempValues.reps ?? ""}
                                    placeholder="Reps"
                                    className="text-center max-w-30 bg-white"
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
                            <div className="text-center">
                              {exercise.isNew ||
                              (isEditing.bool &&
                                isEditing.exercise.id === exercise.id) ? (
                                <div className="flex justify-center">
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "rpe",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={1}
                                    max={10}
                                    value={set.rpe ?? ""}
                                    placeholder="RPE"
                                    className="text-center max-w-30 bg-white"
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        Math.min(10, Number(e.target.value))
                                      );
                                      if (exercise.isNew) {
                                        handleNewExerciseSetChange(
                                          exercise.id,
                                          index,
                                          "rpe",
                                          value.toString()
                                        );
                                      } else {
                                        handleEditInput(set, "rpe", value);
                                      }
                                    }}
                                  />
                                </div>
                              ) : isAddingSet.bool &&
                                isAddingSet.exerciseId === exercise.id &&
                                set.isNew ? (
                                <div className="flex justify-center">
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-"].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onFocus={() =>
                                      setActiveSlider({
                                        type: "rpe",
                                        exerciseId: exercise.id,
                                        setIndex: index,
                                      })
                                    }
                                    min={1}
                                    max={10}
                                    value={tempValues.rpe ?? ""}
                                    placeholder="RPE"
                                    className="text-center max-w-30 bg-white"
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        Math.min(10, Number(e.target.value))
                                      );
                                      setTempValues((prev) => ({
                                        ...prev,
                                        rpe: value,
                                      }));
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="text-md font-bold text-gray-800">
                                  {set.rpe ?? 5}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* {exercise.isNew && index + 1 === array.length && (
                            <div className="mt-2 group">
                              <div className="relative flex items-center justify-center py-2">
                                <div className="flex-1 h-px bg-gray-300 group-hover:bg-gray-400 transition-colors duration-200" />

                                <div className="absolute transition-opacity duration-200 bg-white px-2">
                                  <Button
                                    onClick={() => {
                                      setTimerIsShowing((prev) => !prev);
                                      setActiveSlider(null);
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                  >
                                    <Clock />
                                    Add Rest
                                  </Button>
                                </div>
                              </div>

                              <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                  timerIsShowing
                                    ? "max-h-[500px] opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="mt-4">
                                  <TimerComponent
                                    duration={duration}
                                    setDuration={setDuration}
                                    timeLeft={timeLeft}
                                    setTimeLeft={setTimeLeft}
                                    timerIsActive={timerIsActive}
                                    setTimerIsActive={setTimerIsActive}
                                    isPaused={isPaused}
                                    setIsPaused={setIsPaused}
                                    timerRef={timerRef}
                                  />
                                </div>
                              </div>
                            </div>
                          )} */}

                          {activeSlider &&
                            activeSlider.exerciseId === exercise.id &&
                            activeSlider.setIndex === index && (
                              <div className="mt-3">
                                <DynamicSlider
                                  type={activeSlider.type}
                                  value={
                                    activeSlider.type === "weight"
                                      ? set.weight ?? 0
                                      : activeSlider.type === "reps"
                                      ? set.reps ?? 0
                                      : set.rpe ?? 5
                                  }
                                  onChange={(newValue: number) => {
                                    if (exercise.isNew) {
                                      handleNewExerciseSetChange(
                                        exercise.id,
                                        index,
                                        activeSlider.type,
                                        newValue.toString()
                                      );
                                    } else if (
                                      isEditing.bool &&
                                      isEditing.exercise.id === exercise.id
                                    ) {
                                      handleEditInput(
                                        set,
                                        activeSlider.type,
                                        newValue.toString()
                                      );
                                    } else if (
                                      isAddingSet.bool &&
                                      isAddingSet.exerciseId === exercise.id &&
                                      set.isNew
                                    ) {
                                      setTempValues((prev) => ({
                                        ...prev,
                                        [activeSlider.type]: newValue,
                                      }));
                                      setExercises((prev) =>
                                        (prev ?? []).map((ex) => {
                                          if (ex.id === exercise.id) {
                                            return {
                                              ...ex,
                                              sets: ex.sets.map(
                                                (s: WorkoutSet, i: number) =>
                                                  i === index
                                                    ? {
                                                        ...s,
                                                        [activeSlider.type]:
                                                          newValue,
                                                      }
                                                    : s
                                              ),
                                            };
                                          }
                                          return ex;
                                        })
                                      );
                                    }
                                  }}
                                />
                              </div>
                            )}
                          <div className="col-span-3 flex items-center justify-center w-full">
                            {exercise.isNew && index + 1 === array.length && (
                              <div className="flex flex-col justify-center items-center w-full mt-2">
                                <div className="flex justify-center items-center w-full gap-3 pb-3">
                                  <Button
                                    onClick={() => cancelLastSet(exercise)}
                                    size="sm"
                                    className="px-3 max-w-max"
                                    variant="outline"
                                  >
                                    <X />
                                    <span>Cancel Set</span>
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      addSetToNewExercise(exercise.id)
                                    }
                                    size="sm"
                                    className="px-3 max-w-max"
                                    variant="outline"
                                  >
                                    <Plus />
                                    <span>Add Set</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {!hasStoredWorkout && (
            <div className="border-t border-gray-200 mb-5" />
          )}
        </div>
      </div>
    </div>
  );
}
