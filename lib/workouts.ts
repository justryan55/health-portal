import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase/supabase-client";

interface Exercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

interface ExercisesByDay {
  [day: number]: Exercise[];
}

interface WorkoutPlan {
  workoutName: string;
  exercises: ExercisesByDay;
}

export const uploadWorkoutToDB = async (workoutPlan: WorkoutPlan) => {
  try {
    const exercisesByDay = workoutPlan.exercises;

    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert({ name: workoutPlan.workoutName })
      .select()
      .single();

    if (workoutError) {
      console.error("Error creating workout:", workoutError);
      return;
    }

    const workout_id = workoutData.id;

    const dayKeys = Object.keys(exercisesByDay);

    const workoutDaysPayload = dayKeys.map((day) => ({
      workout_id,
      day_of_the_week: parseInt(day),
    }));

    const { data: workoutDaysData, error: workoutDaysError } = await supabase
      .from("workout_days")
      .insert(workoutDaysPayload)
      .select();

    if (workoutDaysError) {
      console.error("Error creating workout days:", workoutDaysError);
      return;
    }

    for (const day of dayKeys) {
      const workout_day = workoutDaysData.find(
        (wd) => wd.day_of_the_week === parseInt(day)
      );
      const entries = exercisesByDay[day].map((ex) => ({
        workout_day_id: workout_day.id,
        exercise_name: ex.exercise,
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        weight: ex.weight || 0,
      }));

      const { error: wdeError } = await supabase
        .from("workout_day_exercises")
        .insert(entries);

      if (wdeError) {
        console.error("Error inserting workout_day_exercises:", wdeError);
      }
    }
    console.log("Workout created successfully");
  } catch {
    console.error("Error uploading workout program to database");
  }
};

export const fetchDailyWorkouts = async (session: Session) => {
  try {
    if (!session || !session.user) return;

    const userId = session.user.id;

    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("id, name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      return;
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    const workoutPlans = [];

    for (const workout of workouts) {
      const { data: workoutDays, error: daysError } = await supabase
        .from("workout_days")
        .select("id, day_of_the_week")
        .eq("workout_id", workout.id)
        .order("day_of_the_week", { ascending: true });

      if (daysError) {
        console.error(
          `Error fetching days for workout ${workout.id}:`,
          daysError
        );
        continue;
      }

      if (!workoutDays || workoutDays.length === 0) {
        continue;
      }

      const workoutPlan = {
        id: workout.id,
        name: workout.name || `Workout Plan ${workout.id}`,
        created_at: workout.created_at,
        days: {},
      };

      for (const day of workoutDays) {
        const { data: exercises, error: exercisesError } = await supabase
          .from("workout_day_exercises")
          .select("exercise_name, sets, reps, weight")
          .eq("workout_day_id", day.id);

        if (exercisesError) {
          console.error(
            `Error fetching exercises for day ${day.id}:`,
            exercisesError
          );
          continue;
        }

        workoutPlan.days[day.day_of_the_week] = exercises || [];
      }

      workoutPlans.push(workoutPlan);
    }

    console.log("Fetched workout plans:", workoutPlans);
    return workoutPlans;
  } catch (err) {
    console.error("Error fetching daily workouts:", err);
    return [];
  }
};
