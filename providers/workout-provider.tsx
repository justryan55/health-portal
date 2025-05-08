"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type WorkoutContextType = {
  isCreatingWorkout: boolean;
  setIsCreatingWorkout: Dispatch<SetStateAction<boolean>>;
};

const WorkoutContext = createContext<WorkoutContextType>({
  isCreatingWorkout: false,
  setIsCreatingWorkout: () => {},
});

export const WorkoutProvider = ({ children }) => {
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
