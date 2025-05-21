import React from "react";
import { Button } from "./ui/button";

export default function BuildDailyWorkoutForm({ date }) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const currentDate = `${day} / ${month} / ${year}`;

  return (
    <div className="flex flex-col justify-center items-center w-full pt-5">
      <p className="pb-2">No workout completed on this date.</p>
      <Button variant="outline">Add Workout</Button>
    </div>
  );
}
