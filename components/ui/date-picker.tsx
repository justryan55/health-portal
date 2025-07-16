"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchExerciseDays } from "@/lib/workouts";

export function DatePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date) => void;
}) {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);
  const [workoutDates, setWorkoutDates] = React.useState<Date[] | null>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getExerciseDays = async () => {
    const res = await fetchExerciseDays();

    if (!res?.success || !res.data) return;

    const dates = res?.data.map((item) => new Date(item.date));

    setWorkoutDates(dates);
  };

  React.useEffect(() => {
    getExerciseDays();
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-max justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {!isMobile && (
            <>{date ? format(date, "PPP") : <span>Pick a date</span>}</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            if (selected && (!date || selected.getTime() !== date.getTime())) {
              setDate(selected);
            }
          }}
          modifiers={{
            workout: workoutDates || [],
          }}
          modifiersClassNames={{
            workout: "workout-day",
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
