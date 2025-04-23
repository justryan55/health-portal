"use client";

import { createContext, useContext, useEffect, useState } from "react";

const gymStats = {
  program: [
    {
      day: "Monday",
      exercises: {},
    },
    {
      day: "Tuesday",
      exercises: {},
    },
    {
      day: "Wednesday",
      exercises: {},
    },
    {
      day: "Thursday",
      exercises: {},
    },
    {
      day: "Friday",
      exercises: {},
    },
    {
      day: "Saturday",
      exercises: {},
    },
    {
      day: "Sunday",
      exercises: {},
    },
  ],
};

const physicalStats = {
  weight: "",
  height: "",
  age: "",
};

const defaultUser = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  lastLogonTime: "",

  physicalStats: physicalStats,
  gymStats: gymStats,
};

const UserContext = createContext({
  user: defaultUser,
  setUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
