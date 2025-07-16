import { ChartLineInteractive } from "@/components/chart-line-interactive";
import Header from "@/components/header";
import { useState } from "react";

export default function Progress() {
  const [selectedExercise, setSelectedExercise] =
    useState<string>("Select Exercise");
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  return (
    <div>
      {/* <ProgressSnapshotCards /> */}
      <Header
        // headerName="Deadlift"
        // headerDescription="Metrics over time"
        dropdown={true}
        dropdownTitle="Select Exercise"
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <ChartLineInteractive
        selectedExercise={selectedExercise}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
    </div>
  );
}
