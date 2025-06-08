import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { nanoid } from "nanoid";
import { Input } from "./ui/input";
import {
  deleteExerciseFromWorkout,
  deletePlan,
  fetchWeeklyPlan,
  updateWorkoutPlan,
} from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { v4 as uuidv4 } from "uuid";
interface Exercise {
  id: string;
  keyId: string;
  isNew?: boolean;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface BuildWorkoutFormProps {
  onWorkoutSaved: () => void;
  hasStoredWorkout: boolean;
  setHasStoredWorkout: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

interface StyledWorkoutPlanProps {
  hasStoredWorkout: boolean;
  workoutName: string;
  days: string[];
  currentDayIndex: number;
  exercisesGroupedByDay: Record<number, Exercise[]>;
  handlePrevDayClick: () => void;
  handleNextDayClick: () => void;
  BuildWorkoutForm: React.ComponentType<BuildWorkoutFormProps>;
  onWorkoutSaved: () => void;
  setHasStoredWorkout: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isCreatingWorkout: boolean;
  setExercisesGroupedByDay: React.Dispatch<
    React.SetStateAction<Record<number, Exercise[]>>
  >;
  workoutId: string;
}

export default function StyledWorkoutPlan({
  hasStoredWorkout,
  workoutName,
  days,
  currentDayIndex,
  exercisesGroupedByDay,
  handlePrevDayClick,
  handleNextDayClick,
  BuildWorkoutForm,
  onWorkoutSaved,
  setHasStoredWorkout,
  isLoading,
  setIsLoading,
  isCreatingWorkout,
  setExercisesGroupedByDay,
  workoutId,
}: StyledWorkoutPlanProps) {
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const getExerciseInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentExercises = exercisesGroupedByDay[currentDayIndex] || [];
  const session = useSupabaseSession();

  const addExerciseToPlan = (day: number) => {
    setExercisesGroupedByDay((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          id: uuidv4(),
          keyId: nanoid(),
          isNew: true,
          exercise_name: "",
          sets: 0,
          reps: 0,
          weight: 0,
        },
      ],
    }));
  };

  const uploadExerciseToDB = async (
    exercise: Exercise,
    exerciseIndex: number
  ) => {
    try {
      await updateWorkoutPlan(exercise, workoutId, currentDayIndex);

      setExercisesGroupedByDay((prev) => ({
        ...prev,
        [currentDayIndex]: prev[currentDayIndex].map((ex, i) =>
          i === exerciseIndex ? { ...ex, isNew: false } : ex
        ),
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const saveAllExercises = async () => {
    try {
      const savePromises = currentExercises.map((exercise, index) =>
        uploadExerciseToDB(exercise, index)
      );

      await Promise.all(savePromises);

      setIsEditingPlan(false);
    } catch (error) {
      console.log("Error saving exercises:", error);
    }
  };

  const cancelEditing = () => {
    setExercisesGroupedByDay((prev) => {
      const dayExercises = prev[currentDayIndex];

      if (!dayExercises) {
        console.log(
          "No exercises found for current day index:",
          currentDayIndex
        );
        return prev;
      }
      return {
        ...prev,
        [currentDayIndex]: dayExercises.filter((exercise) => !exercise.isNew),
      };
    });

    setIsEditingPlan(false);
  };

  const updateExercise = (
    day: number,
    index: number,
    field: string,
    value: string | number
  ) => {
    setExercisesGroupedByDay((prev) => ({
      ...prev,
      [day]: prev[day].map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      ),
    }));
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

  const handleDeleteClick = async (exercise: Exercise, index: number) => {
    const data = await deleteExerciseFromWorkout(exercise);

    if (data.success) {
      setExercisesGroupedByDay((prev) => ({
        ...prev,
        [currentDayIndex]: prev[currentDayIndex].filter((_, i) => i !== index),
      }));
    }
  };

  const handleCancel = (index: number) => {
    setExercisesGroupedByDay((prev) => ({
      ...prev,
      [currentDayIndex]: prev[currentDayIndex].filter((_, i) => i !== index),
    }));
  };

  const handleDeletePlanClick = async () => {
    try {
      if (!session) return;
      const plan = (await fetchWeeklyPlan(session)) || [];
      const [planToBeDeleted] = plan;

      if (!planToBeDeleted) return;

      const data = await deletePlan(planToBeDeleted.id);

      if (data?.success) {
        setHasStoredWorkout(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <BuildWorkoutForm
        onWorkoutSaved={onWorkoutSaved}
        hasStoredWorkout={hasStoredWorkout}
        setHasStoredWorkout={setHasStoredWorkout}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {!isCreatingWorkout && hasStoredWorkout && (
        <>
          <div
            className={`flex ${
              isMobile ? "flex-col gap-2 text-center" : "flex-row"
            } justify-between items-center p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg`}
          >
            <div>
              <h1 className="text-2xl font-bold text-white">{workoutName}</h1>

              <p className="text-gray-300 font-medium">Weekly Workout Plan</p>
            </div>
            {!isEditingPlan ? (
              <div className="flex gap-2 ">
                {/* <Button
                  onClick={() => addExerciseToPlan(currentDayIndex)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 inline" />
                  {!isMobile && <>Add Exercise</>}
                </Button> */}
                {/* {currentExercises.length > 0 && ( */}
                <Button
                  onClick={() => setIsEditingPlan(true)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-4 h-4 inline" />
                  {!isMobile && <>Edit Plan</>}
                </Button>
                {/* )} */}
              </div>
            ) : (
              <div className="flex gap-2 ">
                <Button
                  onClick={() => handleDeletePlanClick()}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline" />
                  {!isMobile && <>Delete Plan</>}
                </Button>

                <Button
                  onClick={() => addExerciseToPlan(currentDayIndex)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 inline" />
                  {!isMobile && <>Add Exercise</>}
                </Button>
                <Button
                  onClick={saveAllExercises}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Save className="w-4 h-4 inline" />
                  {!isMobile && <>Save Changes</>}
                </Button>
                <Button
                  onClick={cancelEditing}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 inline" />
                  {!isMobile && <>Cancel</>}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Button
              onClick={handlePrevDayClick}
              className="p-3 rounded-lg transition-colors border border-gray-200"
              variant="outline"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <h3 className="text-xl font-bold text-black">
                {days[currentDayIndex]}
              </h3>
              <p className="text-gray-600 text-sm">
                Day {currentDayIndex + 1} of 7
              </p>
            </div>

            <Button
              onClick={handleNextDayClick}
              className="p-3 rounded-lg transition-colors border border-gray-200"
              variant="outline"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {currentExercises.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentExercises.map((exercise, index) => {
                const isEditingThisExercise = exercise.isNew || isEditingPlan;

                return (
                  <div
                    key={exercise.keyId}
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-black" />
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-row items-center gap-3 justify-between">
                          {/* {!isMobile ? ( */}
                          <div className="w-10 h-10 min-w-[40px] bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {exercise.exercise_name &&
                            exercise.exercise_name.trim() !== ""
                              ? getExerciseInitials(exercise.exercise_name)
                              : "EX"}
                          </div>
                          {/* ) : (
                            <span></span>
                          )} */}

                          {isEditingThisExercise ? (
                            <Input
                              placeholder="Exercise"
                              value={exercise.exercise_name || ""}
                              className={`${isMobile && "mr-2"}`}
                              onChange={(e) =>
                                updateExercise(
                                  currentDayIndex,
                                  index,
                                  "exercise_name",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <h3 className="text-l font-bold text-gray-800">
                              {exercise.exercise_name}
                            </h3>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditingPlan && !exercise.isNew && (
                            <Button
                              onClick={() => handleDeleteClick(exercise, index)}
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2"
                            >
                              <Trash2
                                className={`w-4 h-4 ${!isMobile && "mr-2"}`}
                              />
                              {!isMobile && <span>Delete</span>}
                            </Button>
                          )}

                          {exercise.isNew && (
                            <Button
                              onClick={() => handleCancel(index)}
                              variant="outline"
                              size="sm"
                            >
                              <X className={`w-4 h-4 ${!isMobile && "mr-2"}`} />
                              {!isMobile && <span>Cancel</span>}
                            </Button>
                          )}

                          {isEditingThisExercise && exercise.isNew && (
                            // exercise.exercise_name &&
                            // exercise.exercise_name.trim() !== "" &&
                            <Button
                              onClick={() =>
                                uploadExerciseToDB(exercise, index)
                              }
                              variant="outline"
                              size="sm"
                            >
                              <Save
                                className={`w-4 h-4 ${!isMobile && "mr-2"}`}
                              />
                              {!isMobile && <span>Save</span>}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                              Sets
                            </div>

                            {isEditingThisExercise ? (
                              <Input
                                placeholder="0"
                                className="text-center bg-white"
                                value={exercise.sets || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    currentDayIndex,
                                    index,
                                    "sets",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <div className="text-md font-bold text-gray-800">
                                {exercise.sets}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                              Reps
                            </div>

                            {isEditingThisExercise ? (
                              <Input
                                placeholder="0"
                                className="text-center bg-white"
                                value={exercise.reps || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    currentDayIndex,
                                    index,
                                    "reps",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <div className="text-md font-bold text-gray-800">
                                {exercise.reps}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                              Weight
                            </div>

                            {isEditingThisExercise ? (
                              <Input
                                placeholder="0"
                                className="text-center bg-white"
                                value={exercise.weight || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    currentDayIndex,
                                    index,
                                    "weight",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <div className="text-md font-bold text-gray-800">
                                {exercise.weight}{" "}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-center space-y-4 flex flex-col justify-center">
                {/* <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
                </div> */}
                <p className="text-gray-600 font-medium">
                  No exercises planned for {days[currentDayIndex]}
                </p>
                <p className="text-gray-500 text-sm">
                  Add exercises to build your workout plan.
                </p>
                <Button
                  onClick={() => addExerciseToPlan(currentDayIndex)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
