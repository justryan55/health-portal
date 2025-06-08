"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { uploadWorkoutPlanToDB } from "@/lib/workouts";
import { useWorkoutContext } from "@/providers/workout-provider";
import { Plus, ChevronRight, ChevronLeft, Trash2, Save, X } from "lucide-react";
import { Input } from "./ui/input";
import { nanoid } from "nanoid";
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

interface WorkoutPlanProps {
  onWorkoutSaved: () => void;
  hasStoredWorkout: boolean;
  setHasStoredWorkout: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

export default function WorkoutPlan({
  onWorkoutSaved,
  hasStoredWorkout,
  setHasStoredWorkout,
  isLoading,
  setIsLoading,
}: WorkoutPlanProps) {
  const { setIsCreatingWorkout } = useWorkoutContext();
  const [isBuilding, setIsBuilding] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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
    field: keyof Exercise,
    value: string
  ) => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [...dayExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: field === "exercise" ? value : Number(value) || null,
    };

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
      { id: nanoid(), exercise: "", sets: null, reps: null, weight: null },
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
    const { error } = await uploadWorkoutPlanToDB(sanitizedWorkoutPlan);

    if (!error) {
      setHasStoredWorkout(true);
      onWorkoutSaved();
    }

    setIsCreatingWorkout((prev: boolean) => !prev);
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
    setIsBuilding(false);

    setWorkoutPlan({
      workoutName: "",
      exercises: exercisesByDay,
    });
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
          <Button onClick={handleStartBuilding} variant="outline">
            Add Workout Plan
          </Button>
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
            placeholder="e.g., PPL Split..."
            value={workoutPlan.workoutName}
            className={`mt-2 max-w-md bg-white text-black ${
              isMobile ? "text-center" : ""
            }`}
          />
        </div>
        <Card className=" mt-5">
          <CardContent className="p-6">
            <div className="space-y-6 relative">
              <Card
                className={`border border-gray-50 bg-gray-50 shadow-none ${
                  isMobile ? "mb-0" : ""
                }`}
              >
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button onClick={prevDay} variant="outline" size="sm">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {!isMobile && <span>Previous</span>}
                    </Button>

                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {days[day]}
                      </h3>
                      {/* <p className="text-gray-500 text-sm font-medium">
                        Day {day + 1} of 7
                      </p> */}
                    </div>

                    <Button onClick={nextDay} variant="outline" size="sm">
                      {!isMobile && <span>Next</span>}

                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                              Exercise
                            </label>
                            <Input
                              type="text"
                              placeholder="Bench Press"
                              value={row.exercise !== null ? row.exercise : ""}
                              onChange={(e) =>
                                handleExerciseInputChange(
                                  index,
                                  "exercise",
                                  e.target.value
                                )
                              }
                              className="border-gray-200 bg-white"
                            />
                          </div>

                          <div className="flex flex-row gap-2 lg:col-span-6">
                            <div>
                              {!isMobile && (
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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
                      className="rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveClick}
                      className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
