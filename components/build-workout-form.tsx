"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { uploadWorkoutToDB } from "@/lib/workouts";
import { useWorkoutContext } from "@/providers/workout-provider";

interface Exercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

type ExercisesByDayProps = {
  [day: number]: Exercise[];
};

export default function BuildWorkoutForm() {
  const { setIsCreatingWorkout } = useWorkoutContext();

  const [exercisesByDay, setExercisesByDay] = useState<ExercisesByDayProps>({
    0: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    1: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    2: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    3: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    4: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    5: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
    6: [{ exercise: "", sets: 0, reps: 0, weight: 0 }],
  });

  const [day, setDay] = useState(0);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleInputChange = (index: number, field: string, value: string) => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [...dayExercises];
    updatedExercises[index][field] = value;

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });
  };

  const addRow = () => {
    const dayExercises = exercisesByDay[day] || [];
    const updatedExercises = [
      ...dayExercises,
      { exercise: "", sets: "", reps: "", weight: "" },
    ];

    setExercisesByDay({
      ...exercisesByDay,
      [day]: updatedExercises,
    });
  };

  const nextDay = () => {
    setDay((prevDay) => (prevDay + 1) % days.length);
  };

  const prevDay = () => {
    setDay((prevDay) => (prevDay - 1 + days.length) % days.length);
  };

  const handleSaveClick = () => {
    uploadWorkoutToDB(exercisesByDay);
    setIsCreatingWorkout((prev: boolean) => !prev);
  };

  const handleDeleteClick = (index: number) => {
    const dayExercises = exercisesByDay[day] || [];

    dayExercises.splice(index, 1);

    setExercisesByDay({
      ...exercisesByDay,
      [day]: [...dayExercises],
    });
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className=" max-w-fit">
        <Card>
          <div className="flex flex-row justify-around ">
            <CardHeader className="w-full">
              <CardTitle>{days[day]}</CardTitle>
              <CardDescription>
                Add your exercises for {days[day]}.
              </CardDescription>
            </CardHeader>
            <div className="flex justify-center px-6">
              <Button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-white text-black border-2 hover:text-white"
              >
                Upload Workout
              </Button>
            </div>
          </div>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Exercise</th>
                    <th className="px-4 py-2 border">Sets</th>
                    <th className="px-4 py-2 border">Reps</th>
                    <th className="px-4 py-2 border">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {(exercisesByDay[day] || []).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={row.exercise}
                          onChange={(e) =>
                            handleInputChange(index, "exercise", e.target.value)
                          }
                          placeholder="Exercise"
                          // className="w-full border px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={row.sets}
                          onChange={(e) =>
                            handleInputChange(index, "sets", e.target.value)
                          }
                          placeholder="Sets"
                          // className="w-full border px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={row.reps}
                          onChange={(e) =>
                            handleInputChange(index, "reps", e.target.value)
                          }
                          placeholder="Reps"
                          // className="w-full border px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={row.weight}
                          onChange={(e) =>
                            handleInputChange(index, "weight", e.target.value)
                          }
                          placeholder="Weight"
                          // className="w-full border px-2 py-1"
                        />
                      </td>

                      {index > 0 && (
                        <td className="px-4 py-2 border">
                          <svg
                            width="16px"
                            height="16px"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            color="#000000"
                            onClick={() => {
                              handleDeleteClick(index);
                            }}
                          >
                            <path
                              d="M6 12H18"
                              stroke="#000000"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-row justify-between">
                <Button
                  onClick={prevDay}
                  className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
                >
                  {"<"}
                </Button>
                <Button
                  onClick={addRow}
                  className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
                >
                  Add Row
                </Button>
                <Button
                  onClick={nextDay}
                  className="mt-4 px-4 py-2 bg-white text-black border-2 hover:text-white"
                >
                  {">"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
