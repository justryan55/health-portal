"use client";

import React, { createContext,  useContext, useState, Dispatch, SetStateAction, PropsWithChildren } from "react";

type WorkoutContextType = {
  isCreatingWorkout: boolean;
  setIsCreatingWorkout: Dispatch<SetStateAction<boolean>>;
};

const WorkoutContext = createContext<WorkoutContextType>({
  isCreatingWorkout: false,
  setIsCreatingWorkout: () => {},
});

export const WorkoutProvider = ({ children }: PropsWithChildren) => {
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);

  return (
    <WorkoutContext.Provider
      value={{
        isCreatingWorkout,
        setIsCreatingWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutContext = () => useContext(WorkoutContext);
