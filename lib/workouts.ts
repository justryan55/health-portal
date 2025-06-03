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

    const validDayKeys = Object.keys(exercisesByDay).filter((day) => {
      const exercises = exercisesByDay[day];
      return (
        exercises &&
        exercises.length > 0 &&
        exercises.some((ex) => ex.exercise && ex.exercise.trim() !== "")
      );
    });

    if (validDayKeys.length === 0) {
      console.log("No valid exercises found for any day");
      return { data: workoutData, error: null };
    }

    const workoutDaysPayload = validDayKeys.map((day) => ({
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

    for (const day of validDayKeys) {
      const workout_day = workoutDaysData.find(
        (wd) => wd.day_of_the_week === parseInt(day)
      );
      const entries = exercisesByDay[day].map((ex) => ({
        workout_day_id: workout_day.id,
        exercise_name: ex.exercise,
        sets: ex.sets || null,
        reps: ex.reps || null,
        weight: ex.weight || null,
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
          .select("id, exercise_name, sets, reps, weight")
          .eq("workout_day_id", day.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

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
      .eq("daily_workout_id", dailyWorkoutId)
      .eq("is_deleted", false);
    // .single();

    if (exerciseError) {
      console.log("exerciseError", exerciseError);
      return null;
    }

    console.log("Data", exerciseData);

    if (exerciseData.length <= 0) {
      return null;
    }

    const exercisesWithSets = await Promise.all(
      exerciseData.map(async (exercise) => {
        const { data: sets, error: setsError } = await supabase
          .from("sets")
          .select()
          .eq("exercise_id", exercise?.id)
          .eq("is_deleted", false)
          .order("order", { ascending: true });

        console.log("setData", sets);
        if (setsError) {
          console.log("setsError", setsError);
          return { ...exercise, sets: [] };
        }

        return {
          id: exercise.id,
          name: exercise.name,
          sets: sets.map((set) => ({
            setId: set.id,
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
  console.log("ex", exercise);
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

    const setsPayload = exercise.sets.map((set, index) => ({
      exercise_id: exerciseId,
      weight: set.weight,
      reps: set.reps,
      order: index,
    }));

    console.log("Payload", setsPayload);

    console.log("2", exercise.set);
    const { data: insertedSets, error: setError } = await supabase
      .from("sets")
      .insert(setsPayload)
      .select();

    if (setError) {
      console.log(setError);
      return;
    }

    const formattedSets = insertedSets.map((set) => ({
      setId: set.id,
      weight: set.weight,
      reps: set.reps,
    }));
    return {
      success: true,
      exercise: {
        id: exerciseId,
        name: exercise.name,
        sets: formattedSets,
      },
    };

    console.log(data);
  } catch (err) {
    console.log(err);
  }
};

export const deleteExercise = async ({ id }) => {
  const { data, error } = await supabase
    .from("exercises")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    console.log(error);
  }

  return {
    message: "Exercise deleted",
  };
};

export const deleteSet = async (id) => {
  console.log(id);
  const { data, error } = await supabase
    .from("sets")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return error;
  }

  return {
    message: "Set deleted",
  };
};

export const updateSet = async (set, field, value) => {
  const id = set.setId;

  const { data, error } = await supabase
    .from("sets")
    .update({ [field]: value })
    .eq("id", id)
    .select();

  console.log(data);
  if (error) {
    return error;
  }

  return {
    message: "Set updated",
  };
};

export const addSet = async (exercise, values) => {
  const { data, error } = await supabase
    .from("sets")
    .insert([
      {
        exercise_id: exercise.id,
        weight: values.weight || 0,
        reps: values.reps || 0,
        order: exercise.sets.length,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Add set error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    set: {
      setId: data.id,
      weight: data.weight,
      reps: data.reps,
    },
  };
};

export const updateWorkoutPlan = async (exercise, workoutId, day) => {
  try {
    let { data: workoutDayData, error: workoutDayError } = await supabase
      .from("workout_days")
      .select("id")
      .eq("workout_id", workoutId)
      .eq("day_of_the_week", day)
      .single();

    if (workoutDayError || !workoutDayData) {
      const { data: insertData, error: insertError } = await supabase
        .from("workout_days")
        .insert({
          workout_id: workoutId,
          day_of_the_week: day,
        })
        .select()
        .single();

      if (insertError || !insertData) {
        throw new Error(
          `Failed to insert workout day: ${
            insertError?.message || "Unknown error"
          }`
        );
      }

      workoutDayData = insertData;
    }

    const upsertPayload = {
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      exercise_name: exercise.exercise_name,
      workout_day_id: workoutDayData.id,
    };

    if (exercise.id) {
      upsertPayload.id = exercise.id;
    }

    const { data, error } = await supabase
      .from("workout_day_exercises")
      .upsert(upsertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: exercise.id
        ? "Exercise updated successfully"
        : "Exercise created successfully",
    };
  } catch (error) {
    console.error("Error in updateWorkoutPlanUpsert:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to update workout plan",
    };
  }
};

export const deleteExerciseFromWorkout = async (exercise) => {
  const { data, error } = await supabase
    .from("workout_day_exercises")
    .update({ is_deleted: true })
    .eq("id", exercise.id);

  if (error) {
    console.log(error);
    return { success: false, error: error };
  }

  return {
    success: true,
  };
};
