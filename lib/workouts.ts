import { createClient } from "./supabase/supabase-client";

const supabase = createClient();

export const fetchWorkouts = async () => {
  const { data, error } = await supabase.from("workouts").select();
  console.log(data);
};

export const addWorkout = async () => {
  const { data, error } = await supabase.auth.getUser();
  console.log(data);

  // const { data, error } = await supabase
  //   .from("workouts")
  //   .insert({ name: "PPL" });

  console.log(error);
};
