"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Timer } from "lucide-react";

export default function TimerComponent() {
  // const isMobile = useIsMobile();

  const isMobile = true;
  const [initialTime, setInitialTime] = useState<number>(0);

  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerIsActive, setTimerIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultTimers = [
    {
      timer: 30,
      duration: 30,
    },
    {
      timer: 45,
      duration: 45,
    },
    {
      timer: 60,
      duration: 60,
    },
    {
      timer: 90,
      duration: 90,
    },
    {
      timer: 120,
      duration: 120,
    },
  ];
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDuration(Number(e.target.value) || "");
  };

  const handlePreset = (durationValue: number) => {
    setDuration(durationValue);
    setTimeLeft(durationValue);
    setInitialTime(durationValue);
    setTimerIsActive(true);
    setIsPaused(false);
    setIsSetup(true);
    setIsSetup(true);
  };

  const handleSetDuration = (): void => {
    if (typeof duration === "number" && duration > 0) {
      setTimeLeft(duration);
      setInitialTime(duration);
      setTimerIsActive(true);
      setIsPaused(false);
      setIsSetup(true);
      setIsSetup(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleStart = (): void => {
    if (timeLeft > 0) {
      setTimerIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePause = (): void => {
    if (timerIsActive) {
      setTimerIsActive(false);
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleReset = (): void => {
    setIsSetup(false);
    setTimerIsActive(false);
    setIsPaused(false);
    setDuration("");
    setTimeLeft(typeof duration === "number" ? duration : 0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (timerIsActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerIsActive, isPaused]);

  const progressValue = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-accent-foreground">
          <Timer /> Start Timer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rest Timer</DialogTitle>
          <DialogDescription>
            Choose a duration below or set your own duration.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          {!isSetup ? (
            <div
              className={`flex items-center mb-6 justify-between ${
                isMobile ? "flex-col gap-4" : "flex-row "
              }`}
            >
              <div className={`flex flex-row gap-2 ${!isMobile ? "pr-2" : ""}`}>
                {defaultTimers.map((timer) => (
                  <Button
                    key={timer.timer}
                    variant="outline"
                    onClick={() => handlePreset(timer.duration)}
                  >
                    {timer.timer}
                  </Button>
                ))}
              </div>
              <div className="flex flex-row gap-2">
                {!isMobile && <Label>Custom Duration (sec): </Label>}
                <Input
                  type="number"
                  id="duration"
                  placeholder="Enter duration in seconds"
                  value={duration}
                  onChange={handleDurationChange}
                  className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 "
                />
                <Button
                  onClick={handleSetDuration}
                  variant="outline"
                  className="text-gray-800 dark:text-gray-200"
                >
                  Set
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div>
                <Progress value={progressValue} className="h-4 relative" />
                <div className="absolute r-0 text-sm font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="flex justify-center gap-4 pt-6">
                <Button
                  onClick={isPaused ? handleStart : handlePause}
                  variant="outline"
                  className="text-gray-800 dark:text-gray-200"
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="text-gray-800 dark:text-gray-200"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
