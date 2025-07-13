"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchExerciseStats } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";

export const description =
  "Workout Progress Chart (Volume, Reps, Sets, Weight)";

// const workoutData = [
//   { date: "2024-06-01", sets: 4, reps: 8, weight: 80 },
//   { date: "2024-06-02", sets: 3, reps: 10, weight: 85 },
//   { date: "2024-06-03", sets: 5, reps: 5, weight: 90 },
//   { date: "2024-06-04", sets: 4, reps: 6, weight: 100 },
//   { date: "2024-06-05", sets: 3, reps: 8, weight: 95 },
//   { date: "2024-06-06", sets: 4, reps: 10, weight: 90 },
//   { date: "2024-06-07", sets: 4, reps: 6, weight: 105 },
// ].map((entry) => ({
//   ...entry,
//   volume: entry.sets * entry.reps * entry.weight,
// }));

const chartConfig = {
  volume: {
    label: "Volume",
    // label: "Volume (Sets × Reps × Weight)",
    color: "var(--chart-1)",
  },
  sets: {
    label: "Sets",
    color: "var(--chart-3)",
  },
  reps: {
    label: "Reps",
    color: "var(--chart-2)",
  },
  weight: {
    label: "Weight",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

type ChartLineInteractiveProps = {
  selectedExercise: string;
  selectedPeriod: number;
  setSelectedPeriod: () => void;
};

type WorkoutSet = {
  weight: number;
  reps: number;
  rpe: number;
  completed_at: string;
};

type WorkoutEntry = {
  id: string;
  name: string;
  date_completed?: string;
  sets: WorkoutSet[];
};

export function ChartLineInteractive({
  selectedExercise,
  selectedPeriod,
}: ChartLineInteractiveProps) {
  const [activeMetric, setActiveMetric] =
    React.useState<keyof typeof chartConfig>("volume");

  const [workoutData, setWorkoutData] = React.useState<WorkoutEntry[]>([]);

  const session = useSupabaseSession();

  const filteredWorkoutData = React.useMemo(() => {
    if (!workoutData.length) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod);

    return workoutData
      .filter((entry) => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date!).getTime();
        const dateB = new Date(b.date!).getTime();
        return dateA - dateB;
      });
  }, [workoutData, selectedPeriod]);

  const totals = React.useMemo(() => {
    if (!filteredWorkoutData.length) {
      return { volume: 0, reps: 0, sets: 0, weight: 0 };
    }

    const totalVolume = filteredWorkoutData.reduce(
      (acc, cur) => acc + (cur.volume ?? 0),
      0
    );
    const totalSets = filteredWorkoutData.reduce(
      (acc, cur) => acc + (cur.sets ?? 0),
      0
    );
    const totalReps = filteredWorkoutData.reduce(
      (acc, cur) => acc + (cur.reps ?? 0),
      0
    );

    const totalWeight = filteredWorkoutData.reduce(
      (acc, cur) => acc + (cur.weight ?? 0),
      0
    );
    const averageWeight = totalWeight / filteredWorkoutData.length;

    return {
      volume: totalVolume,
      reps: totalReps,
      sets: totalSets,
      weight: Math.round(averageWeight),
    };
  }, [filteredWorkoutData]);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!session || !session.user) return;

      const res = await fetchExerciseStats(session?.user.id, selectedExercise);
      const rawData = res?.data ?? [];

      const chartData = rawData.map((exercise) => {
        const sets = exercise.sets.length;

        const reps = exercise.sets.reduce((acc, set) => {
          return acc + set.reps;
        }, 0);

        const averageWeight =
          exercise.sets.reduce((acc, set) => {
            return acc + set.weight;
          }, 0) / exercise.sets.length;

        const volume = sets * reps * averageWeight;

        return {
          date: exercise.date_completed,
          sets,
          reps,
          weight: Math.round(averageWeight),
          volume: Math.round(volume),
        };
      });

      setWorkoutData(chartData);
    };

    fetchStats();
  }, [session, selectedExercise]);

  return (
    <>
      <Card className="py-4 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center text-left gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle>Workout Tracker</CardTitle>
            <CardDescription>
              {selectedExercise} metrics over the last {selectedPeriod} days
            </CardDescription>
          </div>
          <div className="flex">
            {Object.keys(chartConfig).map((key) => {
              const metric = key as keyof typeof chartConfig;
              return (
                <button
                  key={metric}
                  data-active={activeMetric === metric}
                  className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveMetric(metric)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[metric].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {totals[metric as keyof typeof totals].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={filteredWorkoutData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    nameKey={activeMetric}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line
                dataKey={activeMetric}
                type="monotone"
                stroke={`var(--color-${activeMetric})`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
