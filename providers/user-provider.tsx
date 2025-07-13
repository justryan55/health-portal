"use client";

import { supabase } from "@/lib/supabase/supabase-client";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  fullName: string;
  email: string;
  lastLogonTime: string;
  avatar: string;
  onboardingCompleted: boolean;
}

interface UserProviderProps {
  children: React.ReactNode;
}

interface UserContextType {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

const defaultUser: User = {
  fullName: "",
  email: "",
  lastLogonTime: "",
  avatar: "",
  onboardingCompleted: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(defaultUser);

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", data.user?.id)
      .single();

    if (error) {
      console.error("Error fetching profile", error);
    }

    const onboardingCompleted = !profileData?.onboarding_complete;

    setUser({
      fullName:
        data.user?.user_metadata.display_name ||
        data.user?.user_metadata.full_name ||
        "",
      email: data.user?.email || "",
      lastLogonTime: data.user?.last_sign_in_at || "",
      avatar: "",
      onboardingCompleted,
    });
  };

  // useEffect(() => {
  //   fetchUser();
  // }, [user.email]);

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(defaultUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
