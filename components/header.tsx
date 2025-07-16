"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchUserExercises } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  dropdown: boolean;
  dropdownTitle: string;
  selectedExercise: string;
  setSelectedExercise: (value: string) => void;
  selectedPeriod: number;
  setSelectedPeriod: (value: number) => void;
}

const timePeriods = [
  { label: "7 days", value: 7 },
  { label: "4 weeks", value: 28 },
  { label: "3 months", value: 90 },
  { label: "6 months", value: 180 },
  { label: "12 months", value: 365 },
];

export default function Header({
  selectedPeriod,
  dropdown = false,
  selectedExercise,
  setSelectedExercise,
  setSelectedPeriod,
}: HeaderProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const session = useSupabaseSession();
  const [exercises, setExercises] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchExerciseBtns = async () => {
      if (!session || !session.user) return;

      const res = await fetchUserExercises(session?.user.id);

      if (!res?.success) return;

      setSelectedExercise(res?.data?.[0] ?? "Select Exercise");
      setExercises(res.data ?? []);
    };

    fetchExerciseBtns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col gap-2 text-center" : "flex-row"
      } justify-between items-center p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg mb-6`}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{selectedExercise}</h1>

        <p className="text-gray-300 font-medium">
          Metrics over the last {selectedPeriod} days
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <select
          aria-label="Select time period"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="appearance-none bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {timePeriods.map(({ label, value }) => (
            <option
              key={value}
              value={value}
              className="bg-gray-700 text-white"
            >
              {label}
            </option>
          ))}
        </select>

        {dropdown && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-black">
                {/* {dropdownTitle} */}
                {selectedExercise}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup
                value={selectedExercise}
                onValueChange={setSelectedExercise}
              >
                {exercises.length === 0 ? (
                  <DropdownMenuRadioItem
                    value="no-exercises"
                    key="no-exercises"
                    disabled
                  >
                    No exercises
                  </DropdownMenuRadioItem>
                ) : (
                  exercises.map((exercise, index) => (
                    <DropdownMenuRadioItem key={index} value={exercise}>
                      {exercise}
                    </DropdownMenuRadioItem>
                  ))
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
