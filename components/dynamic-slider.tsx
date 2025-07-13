"use client";

import { useProfile } from "@/providers/profile-provider";

export const DynamicSlider = ({ type, value, onChange }) => {
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
    <div className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {config.label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {value} {config.unit}
        </span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #000 0%, #000 ${
            ((value - config.min) / (config.max - config.min)) * 100
          }%, #e5e7eb ${
            ((value - config.min) / (config.max - config.min)) * 100
          }%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{config.min}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
};
