"use client";

import { fetchUserProfile } from "@/lib/profile";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Profile {
  fullName: string;
  age: string;
  height: {
    cm: string;
    ft: string;
    in: string;
  };
  weight: string;
  gender: string;
  goals: string[];
  units: string;
}

interface ProfileProviderProps {
  children: React.ReactNode;
  initialProfile?: Partial<Profile>;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export default function ProfileProvider({
  children,
  initialProfile = {},
}: ProfileProviderProps) {
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
