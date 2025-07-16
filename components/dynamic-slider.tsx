"use client";

import { useProfile } from "@/providers/profile-provider";
import { Slider } from "./ui/slider";

type DynamicSliderProps = {
  type: "weight" | "reps" | "rpe" | string;
  value: number;
  onChange: (value: number) => void;
};

export const DynamicSlider = ({
  type,
  value,
  onChange,
}: DynamicSliderProps) => {
  const { profile } = useProfile();
  const getSliderConfig = () => {
    switch (type) {
      case "weight":
        const isMetric = profile.units === "metric";
        return {
          min: 0,
          max: isMetric ? 250 : 500,
          step: isMetric ? 1.25 : 2.5,
          label: `Weight (${isMetric ? "kg" : "lb"})`,
          unit: isMetric ? "kg" : "lb",
        };
      case "reps":
        return {
          min: 1,
          max: 30,
          step: 1,
          label: "Reps",
          unit: "reps",
        };
      case "rpe":
        return {
          min: 1,
          max: 10,
          step: 0.5,
          label: "RPE",
          unit: "",
        };
      default:
        return {
          min: 0,
          max: 10,
          step: 1,
          label: "Value",
          unit: "",
        };
    }
  };

  const config = getSliderConfig();

  return (
    <div className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {config.label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {value} {config.unit}
        </span>
      </div>
      <Slider
        max={config.max}
        min={config.min}
        step={config.step}
        value={[value]}
        onValueChange={(newValues) => onChange(newValues[0])}
        className="my-2"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{config.min}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
};
