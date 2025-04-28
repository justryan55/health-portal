"use client";

import { createClient } from "@/lib/supabase/supabase-client";
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
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(defaultUser);

  const fetchUser = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    setUser({
      fullName:
        data.user?.user_metadata.display_name ||
        data.user?.user_metadata.full_name ||
        "",
      email: data.user?.email || "",
      lastLogonTime: data.user?.last_sign_in_at || "",
      avatar: "",
    });
  };

  useEffect(() => {
    fetchUser();
  }, [user.email]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
