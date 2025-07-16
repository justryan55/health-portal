"use client";

import { fetchUserProfile } from "@/lib/profile";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Profile {
  fullName: string;
  age: number | null;
  height: {
    cm: number | null;
    ft: number | null;
    in: number | null;
  };
  weight: number | null;
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
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    age: null,
    height: {
      cm: null,
      ft: null,
      in: null,
    },
    weight: null,
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
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider.");
  }

  return context;
}
