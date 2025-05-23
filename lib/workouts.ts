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

export const uploadWorkoutPlanToDB = async (workoutPlan: WorkoutPlan) => {
  try {
    const exercisesByDay = workoutPlan.exercises;

    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert({ name: workoutPlan.workoutName })
      .select()
      .single();

    if (workoutError) {
      console.error("Error creating workout:", workoutError);
      return { data: null, error: workoutError };
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
      return { data: null, error: workoutDaysError };
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
        return { data: null, error: wdeError };
      }
    }
    console.log("Workout created successfully");
    return { data: workoutData, error: null };
  } catch (err) {
    console.error("Error uploading workout program to database");
    return { data: null, error: err };
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

export const fetchDailyWorkout = async (session, date) => {
  try {
    if (!session || !session.user) return;

    const userId = session.user.id;

    const { data: dailyWorkout, error: dailyWorkoutError } = await supabase
      .from("daily_workouts")
      .select()
      .eq("date", date)
      .eq("user", userId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("1", dailyWorkout);
    if (dailyWorkoutError) {
      console.log("dailyWorkoutError", dailyWorkoutError);
      return null;
    }

    const dailyWorkoutId = dailyWorkout.id;

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select()
      .eq("daily_workout_id", dailyWorkoutId);
    // .single();

    if (exerciseError) {
      console.log("exerciseError", exerciseError);
      return null;
    }

    console.log("Data", exerciseData);

    const exercisesWithSets = await Promise.all(
      exerciseData.map(async (exercise) => {
        const { data: sets, error: setsError } = await supabase
          .from("sets")
          .select()
          .eq("exercise_id", exercise?.id);

        if (setsError) {
          console.log("setsError", setsError);
          return { ...exercise, sets: [] };
        }

        return {
          name: exercise.name,
          sets: sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
          })),
        };
      })
    );
    return exercisesWithSets;
  } catch (err) {
    console.log(err);
  }
};

export const uploadExerciseToDB = async (session, exercise, date) => {
  try {
    if (!session || !session.user) return;
    const userId = session.user.id;

    const { data: existingWorkout, error: fetchError } = await supabase
      .from("daily_workouts")
      .select()
      .eq("date", date)
      .eq("user", userId)
      .maybeSingle();

    if (fetchError) {
      console.log("Fetch error:", fetchError);
      return;
    }

    let dailyWorkout = existingWorkout;

    // Insert if not found
    if (!dailyWorkout) {
      const { data: newWorkout, error: insertError } = await supabase
        .from("daily_workouts")
        .insert([{ date: date, user: userId }]) // ensure user is included
        .select()
        .single();

      if (insertError) {
        console.log("Insert error:", insertError);
        return;
      }

      dailyWorkout = newWorkout;
    }
    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .insert([{ daily_workout_id: dailyWorkout.id, name: exercise.name }])
      .select()
      .single();

    if (exerciseError) {
      console.log(exerciseError);
    }

    const exerciseId = exerciseData.id;
    // console.log("1", exerciseData);

    const setsPayload = exercise.set.map((set) => ({
      exercise_id: exerciseId,
      weight: set.weight,
      reps: set.reps,
    }));

    console.log("Payload", setsPayload);

    console.log("2", exercise.set);
    const { data, error } = await supabase
      .from("sets")
      .insert(setsPayload)
      .select();

    if (error) {
      console.log(error);
    }
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
