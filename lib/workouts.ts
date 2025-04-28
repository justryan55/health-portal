import { supabase } from "./supabase/supabase-client";

export const fetchWorkouts = async () => {
  const { data, error } = await supabase.from("workouts").select();
};

export const addWorkout = async () => {
  // const { data, error } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("workouts")
    .insert({ name: "PPL" });
};
