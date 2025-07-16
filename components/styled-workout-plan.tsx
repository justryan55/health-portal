import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Save,
  X,
  Trash2,
  Replace,
} from "lucide-react";
import { Button } from "./ui/button";
import { nanoid } from "nanoid";
import { Input } from "./ui/input";
import {
  deleteExerciseFromWorkout,
  deletePlan,
  fetchWeeklyPlan,
  toggleSelectedPlan,
  updateWorkoutPlan,
} from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { v4 as uuidv4 } from "uuid";
import { getEmptyWorkoutPlan } from "./get-empty-workout-plan";
import { ExerciseAutocompleteInput } from "./exercise-autocomplete-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Exercise {
  id: string;
  keyId: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  libraryId?: string;
  isNew?: boolean;
}

interface BuildWorkoutFormProps {
  onWorkoutSaved: () => void;
  hasStoredWorkout: boolean;
  setHasStoredWorkout: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setIsEditingPlan: (value: boolean) => void;
  exercisesByDay: BuildWorkoutExercises;
  setExercisesByDay: React.Dispatch<
    React.SetStateAction<BuildWorkoutExercises>
  >;
  workoutPlan: { workoutName: string; exercises: BuildWorkoutExercises };
  setWorkoutPlan: React.Dispatch<
    React.SetStateAction<{
      workoutName: string;
      exercises: BuildWorkoutExercises;
    }>
  >;
  day: number;
  setDay: React.Dispatch<React.SetStateAction<number>>;
  isBuilding: boolean;
  setIsBuilding: React.Dispatch<React.SetStateAction<boolean>>;
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
  isEditingPlan: boolean;
  setIsEditingPlan: (value: boolean) => void;
  setWorkoutName: (value: string) => void;
  setWorkoutId: (value: string) => void;
  setIsCreatingWorkout: React.Dispatch<React.SetStateAction<boolean>>;
}

interface BuildWorkoutExercises {
  [day: number]: {
    id: string;
    exercise: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }[];
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
  isEditingPlan,
  setIsEditingPlan,
  setWorkoutName,
  setWorkoutId,
  setIsCreatingWorkout,
}: StyledWorkoutPlanProps) {
  // const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [exercisesByDay, setExercisesByDay] = useState<BuildWorkoutExercises>({
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

  interface WorkoutDayExercise {
    exercise_library_id: string;
    id: string;
    exercise_name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }

  type SavedWorkout = {
    id: string;
    name: string;
    created_at: string;
    days: { [key: number]: WorkoutDayExercise[] };
  };

  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

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
  const [isBuilding, setIsBuilding] = useState(false);

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
      toast.error("Error uploading exercise.");
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
      toast.error("Error saving exercises.");
      console.log("Error saving exercises:", error);
    }
  };

  const cancelEditing = () => {
    setExercisesGroupedByDay((prev) => {
      const dayExercises = prev[currentDayIndex];

      if (!dayExercises) {
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

    if (!data.success) {
      toast.error("Error deleting exercise.");
      return;
    }

    setExercisesGroupedByDay((prev) => ({
      ...prev,
      [currentDayIndex]: prev[currentDayIndex].filter((_, i) => i !== index),
    }));
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

      const data = await deletePlan(workoutId);

      if (!data?.success) {
        toast.error("Error deleting plan.");
        return;
      }

      const availablePlans = await fetchWeeklyPlan(session);

      if (availablePlans && availablePlans.length > 0) {
        const firstPlan = availablePlans[0];
        setWorkoutId(firstPlan.id);
        setWorkoutName(firstPlan.name);
        setExercisesGroupedByDay(
          Object.fromEntries(
            Object.entries(firstPlan.days).map(([day, exercises]) => [
              Number(day),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              exercises.map((ex: any) => ({
                id: ex.id,
                keyId: ex.keyId ?? nanoid(),
                exercise_name: ex.exercise_name ?? ex.exercise ?? "",
                sets: ex.sets ?? 0,
                reps: ex.reps ?? 0,
                weight: ex.weight ?? 0,
                libraryId: ex.libraryId,
                isNew: ex.isNew ?? false,
              })),
            ])
          ) as Record<number, Exercise[]>
        );
        setIsEditingPlan(false);
        setSavedWorkouts(availablePlans);
      } else {
        setHasStoredWorkout(false);
        const emptyPlan = getEmptyWorkoutPlan();
        setExercisesByDay(emptyPlan.exercises);
        setWorkoutPlan(emptyPlan);
        setDay(0);
        setSavedWorkouts([]);
      }
    } catch (err) {
      toast.error("Error deleting plan.");
      console.log(err);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      if (!session || !session.user) return;

      const data = await fetchWeeklyPlan(session);

      if (!data || data.length === 0) {
        if (!data) {
          toast.error("Error fetching available workout plans.");
        }
        return;
      }

      setSavedWorkouts(data);
    } catch (err) {
      toast.error("Error fetching available workout plans.");
      console.log(err);
    }
  };

  const changePlan = async (e: SavedWorkout) => {
    setWorkoutId(e.id);
    const dailyExercises = e.days;
    setWorkoutName(e.name);
    setExercisesGroupedByDay(
      Object.fromEntries(
        Object.entries(dailyExercises).map(([day, exercises]) => [
          Number(day),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exercises.map((ex: any) => ({
            id: ex.id,
            keyId: ex.keyId ?? nanoid(),
            exercise_name: ex.exercise_name ?? ex.exercise ?? "",
            sets: ex.sets ?? 0,
            reps: ex.reps ?? 0,
            weight: ex.weight ?? 0,
            libraryId: ex.libraryId,
            isNew: ex.isNew ?? false,
          })),
        ])
      ) as Record<number, Exercise[]>
    );

    const res = await toggleSelectedPlan(e.id);

    if (!res?.success) {
      toast.error("Error changing plans.");
      console.log(res?.message);
    }
  };

  useEffect(() => {
    if (hasStoredWorkout && !isCreatingWorkout) {
      fetchAvailablePlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStoredWorkout, isCreatingWorkout, workoutId]);

  const isSaveDisabled = currentExercises.some((exercise) => {
    return (
      !exercise.exercise_name ||
      exercise.exercise_name.trim() === "" ||
      !exercise.sets ||
      !exercise.reps ||
      !exercise.weight ||
      isNaN(exercise.sets) ||
      isNaN(exercise.reps) ||
      isNaN(exercise.weight) ||
      exercise.sets < 1 ||
      exercise.reps < 1 ||
      exercise.weight < 0
    );
  });

  return (
    <div className="w-full space-y-6">
      <BuildWorkoutForm
        onWorkoutSaved={onWorkoutSaved}
        hasStoredWorkout={hasStoredWorkout}
        setHasStoredWorkout={setHasStoredWorkout}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setIsEditingPlan={setIsEditingPlan}
        exercisesByDay={exercisesByDay}
        setExercisesByDay={setExercisesByDay}
        workoutPlan={workoutPlan}
        setWorkoutPlan={setWorkoutPlan}
        day={day}
        setDay={setDay}
        isBuilding={isBuilding}
        setIsBuilding={setIsBuilding}
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
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                {/* <Button
                  onClick={() => addExerciseToPlan(currentDayIndex)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 inline" />
                  {!isMobile && <>Add Exercise</>}
                </Button> */}
                {/* {currentExercises.length > 0 && ( */}

                <Button
                  onClick={() => {
                    setIsBuilding(true);
                    setIsCreatingWorkout(true);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Edit Plan</>} */}
                  New Plan
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={() => fetchAvailablePlans()}
                  >
                    <Button
                      variant="outline"
                      className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      {/* {dropdownTitle} */}
                      <Replace className="w-4 h-4 inline" />
                      Change Plan
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={workoutId}
                      onValueChange={(id) => {
                        const selected = savedWorkouts.find((w) => w.id === id);
                        if (selected) changePlan(selected);
                      }}
                    >
                      {savedWorkouts.length === 0 ? (
                        <DropdownMenuRadioItem
                          value="no-exercises"
                          key="no-exercises"
                          disabled
                        >
                          No other plans
                        </DropdownMenuRadioItem>
                      ) : (
                        savedWorkouts.map((workout) => (
                          <DropdownMenuRadioItem
                            key={workout.id}
                            value={workout.id}
                          >
                            {workout.name}
                          </DropdownMenuRadioItem>
                        ))
                      )}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => setIsEditingPlan(true)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors col-span-2"
                >
                  <Edit className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Edit Plan</>} */}
                  Edit Plan
                </Button>
                {/* )} */}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2  lg:flex lg:gap-2">
                <Button
                  onClick={() => handleDeletePlanClick()}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Delete Plan</>} */}
                  <>Delete Plan</>
                </Button>

                <Button
                  onClick={() => addExerciseToPlan(currentDayIndex)}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Add Exercise</>} */}
                  <>Add Exercise</>
                </Button>
                <Button
                  disabled={isSaveDisabled}
                  onClick={saveAllExercises}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Save className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Save Changes</>} */}
                  <>Save Changes</>
                </Button>
                <Button
                  onClick={cancelEditing}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 inline" />
                  {/* {!isMobile && <>Cancel</>} */}
                  <>Cancel</>
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
                    key={exercise.id}
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
                            <ExerciseAutocompleteInput
                              exercise={{
                                id: exercise.id,
                                name: exercise.exercise_name,
                              }}
                              isMobile={isMobile ?? false}
                              handleChange={(exerciseId, value) => {
                                updateExercise(
                                  currentDayIndex,
                                  index,
                                  "exercise_name",
                                  value.name
                                );
                                updateExercise(
                                  currentDayIndex,
                                  index,
                                  "exercise_id",
                                  value.id
                                );
                              }}
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
                              disabled={
                                !exercise.exercise_name ||
                                !exercise.sets ||
                                !exercise.reps ||
                                !exercise.weight ||
                                isNaN(exercise.sets) ||
                                isNaN(exercise.reps) ||
                                isNaN(exercise.weight) ||
                                exercise.sets < 1 ||
                                exercise.reps < 1 ||
                                exercise.weight < 0
                              }
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
