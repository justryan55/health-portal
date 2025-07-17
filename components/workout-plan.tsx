"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toggleSelectedPlan, uploadWorkoutPlanToDB } from "@/lib/workouts";
import { useWorkoutContext } from "@/providers/workout-provider";
import { Plus, ChevronRight, ChevronLeft, Save, X } from "lucide-react";
import { Input } from "./ui/input";
import { nanoid } from "nanoid";
import Image from "next/image";
import spinnerBlack from "@/public/spinner-black.svg";
import { getEmptyWorkoutPlan } from "./get-empty-workout-plan";
import { ExerciseAutocompleteInput } from "./exercise-autocomplete-input";
import { toast } from "sonner";

interface Exercise {
  id: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  libraryId?: string;
}

export type ExercisesByDayProps = {
  [day: number]: Exercise[];
};

interface WorkoutPlanProps {
  onWorkoutSaved: () => void;
  hasStoredWorkout: boolean;
  setHasStoredWorkout: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setIsEditingPlan: (value: boolean) => void;
  exercisesByDay: ExercisesByDayProps;
  setExercisesByDay: (value: ExercisesByDayProps) => void;
  workoutPlan: { workoutName: string; exercises: ExercisesByDayProps };
  setWorkoutPlan: (value: {
    workoutName: string;
    exercises: ExercisesByDayProps;
  }) => void;
  day: number;
  setDay: (value: number) => void;
  isBuilding: boolean;
  setIsBuilding: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WorkoutPlan({
  onWorkoutSaved,
  hasStoredWorkout,
  setHasStoredWorkout,
  isLoading,
  setIsLoading,
  setIsEditingPlan,
  exercisesByDay,
  setExercisesByDay,
  workoutPlan,
  setWorkoutPlan,
  day,
  setDay,
  isBuilding,
  setIsBuilding,
}: WorkoutPlanProps) {
  const { setIsCreatingWorkout } = useWorkoutContext();
  // const [isBuilding, setIsBuilding] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const isSaveDisabled =
    !workoutPlan.workoutName || exercisesHaveInvalidInputs();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function exercisesHaveInvalidInputs() {
    const exercises = exercisesByDay[day] || [];
    return exercises.some((ex) => {
      if (!ex.exercise || ex.exercise.trim() === "") return true;

      const sets = Number(ex.sets);
      const reps = Number(ex.reps);
      const weight = Number(ex.weight);

      if (
        !ex.sets ||
        !ex.reps ||
        !ex.weight ||
        isNaN(sets) ||
        isNaN(reps) ||
        isNaN(weight) ||
        sets < 1 ||
        reps < 1 ||
        weight < 0
      ) {
        return true;
      }

      return false;
    });
  }

  const handleExerciseInputChange = (
    index: number,
    field: keyof Exercise,
    value: string | { name: string; id: string }
  ) => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [...dayExercises];

    if (field === "exercise" && typeof value === "object") {
      updatedExercises[index] = {
        ...updatedExercises[index],
        exercise: value.name,
        libraryId: value.id,
      };
    } else {
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: field === "exercise" ? value : Number(value) || null,
      };
    }

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });

    setWorkoutPlan({
      ...workoutPlan,
      exercises: { ...exercisesByDay, [day]: updatedExercises },
    });
  };

  const handleTitleChange = (value: string) => {
    setWorkoutPlan({ ...workoutPlan, workoutName: value });
  };

  const addRow = () => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [
      {
        id: nanoid(),
        exercise: "",
        libraryId: "",
        sets: null,
        reps: null,
        weight: null,
      },
      ...dayExercises,
    ];

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });
  };

  const nextDay = () => {
    setDay((day + 1) % days.length);
  };

  const prevDay = () => {
    setDay((day - 1 + days.length) % days.length);
  };

  const handleSaveClick = async () => {
    setIsLoading(true);
    const sanitizedWorkoutPlan = {
      ...workoutPlan,
      exercises: Object.fromEntries(
        Object.entries(workoutPlan.exercises).map(([day, exercises]) => [
          day,
          exercises.map((ex) => ({
            ...ex,
            sets: ex.sets ?? 0,
            reps: ex.reps ?? 0,
            weight: ex.weight ?? 0,
          })),
        ])
      ),
    };

    const { data, error } = await uploadWorkoutPlanToDB(sanitizedWorkoutPlan);

    if (error) {
      toast.error("Error saving plan.");
      return;
    }

    if (!error && data) {
      setHasStoredWorkout(true);
      setIsEditingPlan(false);
      onWorkoutSaved();

      const res = await toggleSelectedPlan(data.id);

      if (!res?.success) {
        console.log(res?.message);
      }

      const emptyPlan = getEmptyWorkoutPlan();
      setExercisesByDay(emptyPlan.exercises);
      setWorkoutPlan(emptyPlan);
      setDay(0);
    }

    setIsCreatingWorkout(false);
    setIsBuilding(false);
    setIsLoading(false);
  };

  const handleDeleteClick = (index: number) => {
    const dayExercises = exercisesByDay[day] || [];
    dayExercises.splice(index, 1);

    setExercisesByDay({
      ...exercisesByDay,
      [day]: [...dayExercises],
    });
  };

  const handleStartBuilding = () => {
    setIsBuilding(true);
  };

  const handleCancel = () => {
    if (hasStoredWorkout) {
      // If there's a stored workout, restore the original plan
      // setExercisesByDay(originalPlan.exercises);
      // setWorkoutPlan(originalPlan);
      setDay(0);
      setIsBuilding(false);
      setIsCreatingWorkout(false);
    } else {
      // If no stored workout, reset to empty plan
      const emptyPlan = getEmptyWorkoutPlan();
      setExercisesByDay(emptyPlan.exercises);
      setWorkoutPlan(emptyPlan);
      setDay(0);
      setIsBuilding(false);
      setIsCreatingWorkout(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[320px] bg-white rounded-2xl border border-gray-100">
        <Image src={spinnerBlack} alt="loading-spinner" className="" priority />
      </div>
    );
  }

  if (!hasStoredWorkout && !isBuilding) {
    return (
      <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-medium">
            No workout plan added yet.
          </p>
          <p className="text-gray-500 text-sm">
            Start your workout by adding your first exercise!
          </p>
          <div
            className={`flex justify-center gap-2 ${isMobile && "flex-col"}`}
          >
            <div>
              <Button onClick={handleStartBuilding} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Build Custom Plan
              </Button>
            </div>
            {/* <div>
              <Button onClick={handleStartBuilding} variant="outline">
                <Book className="w-4 h-4 mr-2" />
                Select Prebuilt Plan
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  if (isBuilding) {
    return (
      <div>
        <div className="flex flex-col justify-between items-start p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg">
          <h1
            className={`text-2xl w-full font-bold text-white ${
              isMobile ? "text-center" : ""
            }`}
          >
            Workout Plan Name
          </h1>
          <Input
            type="text"
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="PPL Split..."
            value={workoutPlan.workoutName}
            className={`mt-2 max-w-md bg-white text-black  ${
              isMobile ? "text-center" : ""
            }`}
          />
        </div>
        <Card
          className={`border border-gray-50 shadow-none ${
            isMobile ? "mb-0" : ""
          }`}
        >
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Button onClick={prevDay} variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {!isMobile && <span>Previous</span>}
            </Button>

            <div className="text-center">
              <h3 className="text-xl font-bold text-black">{days[day]}</h3>
              <p className="text-gray-600 text-sm">Day {day + 1} of 7</p>
            </div>

            <Button onClick={nextDay} variant="outline" size="sm">
              {!isMobile && <span>Next</span>}

              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-black" />

          <CardContent className="p-6">
            <div className="space-y-6 relative">
              <div className="space-y-4">
                <div
                  className={`flex ${
                    isMobile && "flex-col"
                  } items-center justify-between`}
                >
                  {!isMobile && (
                    <h4 className="text-xl pl-1 font-bold text-gray-900">
                      Exercises for {days[day]}
                    </h4>
                  )}

                  <Button
                    onClick={addRow}
                    variant="outline"
                    className={`${
                      isMobile && "mt-2 absolute bottom-0 bottom-[75px]"
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {(exercisesByDay[day] || []).map((row, index) => (
                    <Card
                      key={row.id}
                      className={`border border-gray-100 bg-gray-50 shadow-none relative ${
                        isMobile ? "pb-1" : ""
                      }`}
                    >
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end ">
                          <div className="lg:col-span-5">
                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 ml-1">
                              Exercise
                            </label>
                            <ExerciseAutocompleteInput
                              exercise={{ id: "", name: row.exercise ?? "" }}
                              handleChange={(id, value) =>
                                handleExerciseInputChange(
                                  index,
                                  "exercise",
                                  value
                                )
                              }
                              isMobile={isMobile ?? false}
                            />
                          </div>

                          <div className="flex flex-row gap-2 lg:col-span-6">
                            <div>
                              {!isMobile && (
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 ml-1">
                                  Sets
                                </label>
                              )}
                              <Input
                                type="numeric"
                                placeholder={`${isMobile ? "Sets" : "3"}`}
                                value={row.sets !== null ? row.sets : ""}
                                onChange={(e) =>
                                  handleExerciseInputChange(
                                    index,
                                    "sets",
                                    e.target.value
                                  )
                                }
                                className="border-gray-200 bg-white"
                              />
                            </div>
                            <div>
                              {!isMobile && (
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 ml-1">
                                  Reps
                                </label>
                              )}
                              <Input
                                type="numeric"
                                placeholder={`${isMobile ? "Reps" : "10"}`}
                                value={row.reps !== null ? row.reps : ""}
                                onChange={(e) =>
                                  handleExerciseInputChange(
                                    index,
                                    "reps",
                                    e.target.value
                                  )
                                }
                                className="border-gray-200 bg-white"
                              />
                            </div>
                            <div>
                              {!isMobile && (
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 ml-1">
                                  Weight
                                </label>
                              )}

                              <Input
                                placeholder={`${isMobile ? "Weight" : "80"}`}
                                type="numeric"
                                value={row.weight !== null ? row.weight : ""}
                                onChange={(e) =>
                                  handleExerciseInputChange(
                                    index,
                                    "weight",
                                    e.target.value
                                  )
                                }
                                className="border-gray-200 bg-white"
                              />
                            </div>{" "}
                          </div>

                          <div className="lg:col-span-1 flex justify-center">
                            {(exercisesByDay[day] || []).length > 1 && (
                              <Button
                                onClick={() => handleDeleteClick(index)}
                                variant="ghost"
                                size="sm"
                                className={`text-black-500 hover:text-red-700 hover:bg-red-50 rounded-xl w-10 h-10 p-0 ${
                                  isMobile && "absolute top-0 right-0"
                                }`}
                              >
                                {isMobile ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  // <Trash2 className="w-4 h-4" />
                                  <X className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div
                className={`border-t border-gray-100 pt-6 ${
                  isMobile ? "mt-16" : "mt-8"
                }`}
              >
                <div
                  className={`flex ${
                    !isMobile ? "justify-between" : "justify-center"
                  } items-center`}
                >
                  {!isMobile && (
                    <div className="text-sm text-gray-600 font-medium">
                      Day {day + 1} of 7 •{" "}
                      {
                        (exercisesByDay[day] || []).filter((ex) => ex.exercise)
                          .length
                      }{" "}
                      exercises
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      // className="rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      disabled={isSaveDisabled}
                      onClick={handleSaveClick}
                      // className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>{" "}
      </div>
    );
  }

  return null;
}
