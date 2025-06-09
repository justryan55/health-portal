import { nanoid } from "nanoid";

interface Exercise {
  id: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
}

export type ExercisesByDayProps = {
  [day: number]: Exercise[];
};

export function getEmptyWorkoutPlan(): {
  workoutName: string;
  exercises: ExercisesByDayProps;
} {
  const emptyExercises: ExercisesByDayProps = {
    0: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    1: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    2: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    3: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    4: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    5: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
    6: [{ id: nanoid(), exercise: "", sets: null, reps: null, weight: null }],
  };

  return {
    workoutName: "",
    exercises: emptyExercises,
  };
}
