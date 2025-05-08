import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase/supabase-client";

export const addWorkout = async (exercisesByDay) => {
  const { data: workoutData, error: workoutError } = await supabase
    .from("workouts")
    .insert({ name: "" })
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
};

export const fetchWorkouts = async (session: Session) => {
  console.log(session);
  if (!session) return;
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("workouts")
    .select()
    .eq("user_id", userId);

  if (!data) return;

  if (data.length > 0) {
    return data;
  }

  console.log("Error");
};

export const fetchWorkoutDay = async (session: Session) => {
  try {
    console.log(session);
    if (!session) return;

    const userId = session.user.id;

    const { data, error } = await supabase
      .from("workout_day_exercises")
      .select(
        `
      sets,
      reps,
      weight,
      exercise_name,
      workout_day:workout_day_id (
      day_of_the_week,
        workout:workout_id (
          user_id
        )
      )
    `
      )
      .eq("user_id", userId);

    if (!data) return;

    if (data.length > 0) {
      return data;
    }
  } catch {
    console.log("Error");
  }
};
