"use client";

import { Slider } from "@/components/ui/slider";

export default function NumberSlider({
  rpe,
  onRpeChange,
}: {
  rpe: number | undefined;
  onRpeChange: (rpe: number) => void;
}) {
  return (
    <div className="w-full flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        RPE
      </span>
      <Slider
        value={[rpe ?? 5]}
        color="black"
        onValueChange={(value) => {
          onRpeChange(value[0]);
        }}
        max={10}
        min={1}
        step={1}
      />
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        {rpe ?? 5}
      </span>
    </div>
  );
}
