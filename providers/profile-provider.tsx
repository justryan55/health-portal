"use client";

import { fetchUserProfile } from "@/lib/profile";
import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext(null);

export default function ProfileProvider({ children, initialProfile = {} }) {
  const [profile, setProfile] = useState({
    fullName: "",
    age: "",
    height: {
      cm: "",
      ft: "",
      in: "",
    },
    weight: "",
    gender: "",
    goals: [],
    units: "metric",
    ...initialProfile,
  });

  const fetchProfile = async () => {
    const res = await fetchUserProfile();

    if (!res.success) return;

    const profileData = res.data;


    setProfile((prev) => ({
      ...prev,
      fullName: profileData.fullName ?? "",
      age: profileData.age ?? "",
      height: {
        cm: profileData.height_cm ?? "",
        ft: profileData.height_ft ?? "",
        in: profileData.height_in ?? "",
      },
      weight: profileData.weight,
      gender: profileData.gender,
      goals: profileData.goals || [],
      units: profileData.units || "metric",
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
