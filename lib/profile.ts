import { supabase } from "./supabase/supabase-client";

export const updateUserProfile = async (profile) => {
  const dbProfile = {
    name: profile.fullName,
    age: profile.age ? parseInt(profile.age) : null,
    weight: profile.weight ? parseFloat(profile.weight) : null,
    gender: profile.gender || null,
    units: profile.units || "metric",
    goals: profile.goals || [],

    height_cm:
      profile.units === "metric"
        ? profile.height?.cm
          ? parseFloat(profile.height.cm)
          : null
        : null,
    height_ft:
      profile.units === "imperial"
        ? profile.height?.ft
          ? parseFloat(profile.height.ft)
          : null
        : null,
    height_in:
      profile.units === "imperial"
        ? profile.height?.in
          ? parseFloat(profile.height.in)
          : null
        : null,
  };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user");
    }

    const { data, error } = await supabase.from("profiles").upsert([
      {
        id: user.id,
        ...dbProfile,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user?.id)
    .single();

  if (error) {
    return {
      success: false,
      message: error,
    };
  }

  return {
    success: true,
    data,
  };
};

export const updateOnboardingStatus = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  if (error) {
    console.log(error);
    return {
      success: false,
      message: error,
    };
  }

  return {
    success: true,
  };
};
