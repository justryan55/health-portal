import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase/supabase-client";

interface Exercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  libraryId?: string;
}

interface ExercisesByDay {
  [day: number]: Exercise[];
}

interface WorkoutPlan {
  workoutName: string;
  exercises: ExercisesByDay;
}

interface WorkoutData {
  id: string;
  name: string;
  selected_plan: boolean;
  created_at: string;
}

interface WorkoutDay {
  id: string;
  day_of_the_week: number;
}

interface WorkoutDayExercise {
  exercise_library_id: string;
  id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
}

interface DailyWorkout {
  id: string;
  date: string;
  user: string;
  is_deleted: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  daily_workout_id: string;
}

interface SetData {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  order: number;
  exercise_id: string;
}

interface ExerciseSet {
  setId: string;
  weight: number;
  reps: number;
  rpe: number;
}

interface ExerciseWithSets {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

interface ExerciseInput {
  name: string;
  libraryId: string;
  sets: Array<{
    weight: number;
    reps: number;
    rpe: number;
  }>;
}

interface SetInput {
  weight?: number;
  reps?: number;
  rpe?: number;
}

interface WorkoutPlanExercise {
  id?: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  exercise_id?: string;
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

    const workout_id = (workoutData as WorkoutData).id;

    const validDayKeys = Object.keys(exercisesByDay).filter((day) => {
      const exercises = exercisesByDay[parseInt(day)];
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
      const workout_day = (workoutDaysData as WorkoutDay[]).find(
        (wd) => wd.day_of_the_week === parseInt(day)
      );
      if (!workout_day) continue;

      const entries = exercisesByDay[parseInt(day)].map((ex) => ({
        workout_day_id: workout_day.id,
        exercise_name: ex.exercise,
        sets: ex.sets || null,
        reps: ex.reps || null,
        weight: ex.weight || null,
        exercise_library_id: ex.libraryId || null,
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

export const fetchWeeklyPlan = async (session: Session) => {
  try {
    if (!session || !session.user) return;

    const userId = session.user.id;

    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("id, name, created_at, selected_plan")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      return;
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    const workoutPlans = [];

    for (const workout of workouts as WorkoutData[]) {
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

      const workoutPlan: {
        id: string;
        name: string;
        selected_plan: boolean;
        created_at: string;
        days: { [key: number]: WorkoutDayExercise[] };
      } = {
        id: workout.id,
        name: workout.name || `Workout Plan ${workout.id}`,
        selected_plan: workout.selected_plan || false,
        created_at: workout.created_at,
        days: {},
      };

      for (const day of workoutDays as WorkoutDay[]) {
        const { data: exercises, error: exercisesError } = await supabase
          .from("workout_day_exercises")
          .select("id, exercise_name, sets, reps, weight, exercise_library_id")
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

        workoutPlan.days[day.day_of_the_week] =
          (exercises as WorkoutDayExercise[]) || [];
      }

      workoutPlans.push(workoutPlan);
    }

    return workoutPlans;
  } catch (err) {
    console.error("Error fetching daily workouts:", err);
    return [];
  }
};

export const fetchDailyWorkout = async (session: Session, date: string) => {
  try {
    if (!session || !session.user) return;

    const userId = session.user.id;

    const { data: dailyWorkout, error: dailyWorkoutError } = await supabase
      .from("daily_workouts")
      .select()
      .eq("date", date)
      .eq("user", userId)
      .eq("is_deleted", false)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dailyWorkoutError) {
      console.log("dailyWorkoutError", dailyWorkoutError);
      return null;
    }

    if (!dailyWorkout) {
      return null;
    }

    const dailyWorkoutId = (dailyWorkout as DailyWorkout).id;

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select()
      .eq("daily_workout_id", dailyWorkoutId)
      .eq("is_deleted", false);

    if (exerciseError) {
      console.log("exerciseError", exerciseError);
      return null;
    }

    if (!exerciseData || exerciseData.length <= 0) {
      return null;
    }

    const exercisesWithSets = await Promise.all(
      (exerciseData as ExerciseData[]).map(async (exercise) => {
        const { data: sets, error: setsError } = await supabase
          .from("sets")
          .select()
          .eq("exercise_id", exercise.id)
          .eq("is_deleted", false)
          .order("order", { ascending: true });

        if (setsError) {
          console.log("setsError", setsError);
          return { id: exercise.id, name: exercise.name, sets: [] };
        }

        return {
          id: exercise.id,
          name: exercise.name,
          sets: (sets as SetData[]).map((set) => ({
            setId: set.id,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
          })),
        };
      })
    );
    return exercisesWithSets;
  } catch (err) {
    console.log(err);
  }
};

export const uploadExerciseToDB = async (
  session: Session,
  exercise: ExerciseInput,
  date: string
) => {
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

    let dailyWorkout = existingWorkout as DailyWorkout | null;

    if (dailyWorkout && dailyWorkout.is_deleted) {
      const { error: restoreError, data: restoredWorkout } = await supabase
        .from("daily_workouts")
        .update({ is_deleted: false })
        .eq("id", dailyWorkout.id)
        .select()
        .single();

      if (restoreError) {
        console.log("Restore error:", restoreError);
        return;
      }

      dailyWorkout = restoredWorkout as DailyWorkout;
    } else if (!dailyWorkout) {
      const { data: newWorkout, error: insertError } = await supabase
        .from("daily_workouts")
        .insert([{ date: date, user: userId }])
        .select()
        .single();

      if (insertError) {
        console.log("Insert error:", insertError);
        return;
      }

      dailyWorkout = newWorkout as DailyWorkout;
    }

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .insert([
        {
          daily_workout_id: dailyWorkout.id,
          name: exercise.name,
          exercise_library_id: exercise.libraryId || null,
          date_completed: date,
        },
      ])
      .select()
      .single();

    if (exerciseError) {
      console.log(exerciseError);
      return;
    }

    const exerciseId = (exerciseData as ExerciseData).id;

    const setsPayload = exercise.sets.map((set, index) => ({
      exercise_id: exerciseId,
      weight: set.weight,
      reps: set.reps,
      rpe: set.rpe,
      order: index,
    }));

    const { data: insertedSets, error: setError } = await supabase
      .from("sets")
      .insert(setsPayload)
      .select();

    if (setError) {
      console.log(setError);
      return;
    }

    const formattedSets = (insertedSets as SetData[]).map((set) => ({
      setId: set.id,
      weight: set.weight,
      reps: set.reps,
      rpe: set.rpe,
    }));

    return {
      success: true,
      exercise: {
        id: exerciseId,
        name: exercise.name,
        sets: formattedSets,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

export const deleteExercise = async ({ id }: { id: string }) => {
  const { error } = await supabase
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

export const deleteSet = async (id: string) => {
  const { error } = await supabase
    .from("sets")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: error,
    };
  }

  return {
    success: true,
    message: "Set deleted",
  };
};

export const updateSet = async (
  set: ExerciseSet,
  field: string,
  value: number
) => {
  const id = set.setId;

  const { error } = await supabase
    .from("sets")
    .update({ [field]: value })
    .eq("id", id)
    .select();

  if (error) {
    return error;
  }

  return {
    message: "Set updated",
  };
};

export const addSet = async (exercise: ExerciseWithSets, values: SetInput) => {
  const { data, error } = await supabase
    .from("sets")
    .insert([
      {
        exercise_id: exercise.id,
        weight: values.weight || 0,
        reps: values.reps || 0,
        rpe: values.rpe || 0,
        order: exercise.sets.length,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Add set error:", error);
    return { success: false, error };
  }

  const setData = data as SetData;
  return {
    success: true,
    set: {
      setId: setData.id,
      weight: setData.weight,
      reps: setData.reps,
      rpe: setData.rpe,
    },
  };
};

export const updateWorkoutPlan = async (
  exercise: WorkoutPlanExercise,
  workoutId: string,
  day: number
) => {
  try {
    // eslint-disable-next-line prefer-const
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

    const typedWorkoutDay = workoutDayData as WorkoutDay;
    const upsertPayload: {
      id?: string;
      sets: number;
      reps: number;
      weight: number;
      exercise_name: string;
      workout_day_id: string;
      exercise_library_id?: string;
    } = {
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      exercise_name: exercise.exercise_name,
      workout_day_id: typedWorkoutDay.id,
      exercise_library_id: exercise.exercise_id || undefined,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in updateWorkoutPlanUpsert:", error);
    return {
      success: false,
      error: errorMessage,
      message: "Failed to update workout plan",
    };
  }
};

export const deleteExerciseFromWorkout = async (exercise: { id: string }) => {
  const { error } = await supabase
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

export const deletePlan = async (planToBeDeleted: string) => {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .update({ is_deleted: true })
      .eq("id", planToBeDeleted);

    if (error) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      message: data,
    };
  } catch (err) {
    console.log(err);
  }
};

export const exerciseSuggestions = async (query: string) => {
  try {
    // if (!query || typeof query !== "string") {
    //   return res.status(400).json([]);
    // }
    const { data, error } = await supabase
      .from("exercise_library")
      .select("name, id")
      .ilike("name", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Autocomplete fetch error:", error);
      return { success: false, message: error };
    }
    const results = data.map(({ id, name }) => ({ id, name }));
    return { success: true, data: results };
  } catch (err) {
    console.log(err);
  }
};

export const fetchUserExercises = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("name, id")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (error) {
      return {
        success: false,
      };
    }

    const exercisesExDuplicates = data.reduce<string[]>((acc, item) => {
      if (!acc.includes(item.name)) {
        acc.push(item.name);
      }
      return acc;
    }, []);

    return {
      success: true,
      data: exercisesExDuplicates,
    };
  } catch (err) {
    console.log(err);
  }
};

export const fetchExerciseStats = async (userId: string, exercise: string) => {
  try {
    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("name, id, date_completed")
      .eq("user_id", userId)
      .eq("name", exercise)
      .eq("is_deleted", false);

    if (exerciseError) {
      return {
        success: false,
      };
    }

    const exerciseWithSets = await Promise.all(
      exerciseData.map(async (exercise) => {
        const { data: setsData, error: setsError } = await supabase
          .from("sets")
          .select("weight, reps, rpe, completed_at")
          .eq("exercise_id", exercise.id);

        if (setsError) {
          console.log("setsError", setsError);
          return { id: exercise.id, name: exercise.name, sets: [] };
        }

        return {
          id: exercise.id,
          name: exercise.name,
          date_completed: exercise.date_completed,
          sets: setsData,
        };
      })
    );

    return {
      success: true,
      data: exerciseWithSets,
    };
  } catch (err) {
    console.log(err);
  }
};

export const fetchExerciseDays = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("daily_workouts")
      .select("date")
      .eq("user", user.id)
      .eq("is_deleted", false);

    if (error) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.log(err);
  }
};

export const toggleSelectedPlan = async (selectedPlan: string) => {
  if (!selectedPlan) {
    return {
      success: false,
    };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: resetError } = await supabase
      .from("workouts")
      .update({ selected_plan: false })
      .eq("user_id", user.id);

    if (resetError) {
      return {
        success: false,
        message: resetError,
      };
    }

    const { data, error: updateError } = await supabase
      .from("workouts")
      .update({ selected_plan: true })
      .eq("id", selectedPlan);

    if (updateError) {
      return {
        success: false,
        message: updateError,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
};

export const fetchSessionsThisMonth = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    ).toISOString();

    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString();

    const { data: currentMonth, error: currentMonthError } = await supabase
      .from("daily_workouts")
      .select()
      .eq("user", user.id)
      .eq("is_deleted", false)
      .gte("date", startOfMonth)
      .lt("date", startOfNextMonth);

    if (currentMonthError) {
      return {
        success: false,
        message: currentMonthError,
      };
    }

    const { data: lastMonth, error: lastMonthError } = await supabase
      .from("daily_workouts")
      .select()
      .eq("user", user.id)
      .eq("is_deleted", false)
      .gte("date", startOfLastMonth)
      .lt("date", startOfMonth);

    if (lastMonthError) {
      return {
        success: false,
        message: lastMonthError,
      };
    }
    return {
      success: true,
      currentMonth,
      lastMonth,
    };
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
};

export const deleteWorkout = async (dateISO: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("daily_workouts")
      .update({ is_deleted: true })
      .eq("user", user.id)
      .eq("date", dateISO);

    if (error) {
      console.error("Error deleting workout:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting workout:", error);
    return { success: false, error };
  }
};

export const fetchWeeklyVolume = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const startOfThisWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diff
    );

    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const calculateVolumeForDateRange = async (
      startDate: Date,
      endDate: Date
    ) => {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .gte("date_completed", startDate.toISOString())
        .lt("date_completed", endDate.toISOString());

      if (exerciseError || !exerciseData) {
        console.log("Exercise fetch error:", exerciseError);
        return 0;
      }

      const exerciseWithSets = await Promise.all(
        exerciseData.map(async (exercise) => {
          const { data: setsData, error: setsError } = await supabase
            .from("sets")
            .select("weight, reps")
            .eq("exercise_id", exercise.id);

          if (setsError || !setsData) {
            console.log("Sets fetch error:", setsError);
            return 0;
          }

          return setsData.reduce((acc, set) => acc + set.weight * set.reps, 0);
        })
      );

      return exerciseWithSets.reduce((acc, volume) => acc + volume, 0);
    };

    const thisWeekVolume = await calculateVolumeForDateRange(
      startOfThisWeek,
      startOfNextWeek
    );

    const lastWeekVolume = await calculateVolumeForDateRange(
      startOfLastWeek,
      startOfThisWeek
    );

    return {
      success: true,
      weeklyVolume: thisWeekVolume,
      previousWeeklyVolume: lastWeekVolume,
    };
  } catch (err) {
    console.log(err);
  }
};

export const fetchWeeklyRPE = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const startOfThisWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diff
    );

    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const calculateWeeklyRPE = async (startDate: Date, endDate: Date) => {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .gte("date_completed", startDate.toISOString())
        .lt("date_completed", endDate.toISOString());

      if (exerciseError || !exerciseData) {
        console.log("Exercise fetch error:", exerciseError);
        return 0;
      }

      let totalRPE = 0;
      let totalSets = 0;

      for (const exercise of exerciseData) {
        const { data: setsData, error: setsError } = await supabase
          .from("sets")
          .select("rpe")
          .eq("exercise_id", exercise.id);

        if (setsError || !setsData) {
          console.log("Sets fetch error:", setsError);
          continue;
        }

        for (const set of setsData) {
          if (set.rpe !== null && set.rpe !== undefined) {
            totalRPE += set.rpe;
            totalSets++;
          }
        }
      }

      return totalSets === 0 ? 0 : totalRPE / totalSets;
    };

    const thisWeekRPE = await calculateWeeklyRPE(
      startOfThisWeek,
      startOfNextWeek
    );

    const lastWeekyRPE = await calculateWeeklyRPE(
      startOfLastWeek,
      startOfThisWeek
    );

    console.log(thisWeekRPE, lastWeekyRPE);

    return {
      success: true,
      weeklyRPE: thisWeekRPE,
      previousWeeklyRPE: lastWeekyRPE,
    };
  } catch (err) {
    console.log(err);
  }
};
