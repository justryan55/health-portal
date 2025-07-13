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
import { fetchUserExercises } from "@/lib/workouts";
import { useSupabaseSession } from "@/providers/supabase-provider";

export const description =
  "Workout Progress Chart (Volume, Reps, Sets, Weight)";

const workoutData = [
  { date: "2024-06-01", sets: 4, reps: 8, weight: 80 },
  { date: "2024-06-02", sets: 3, reps: 10, weight: 85 },
  { date: "2024-06-03", sets: 5, reps: 5, weight: 90 },
  { date: "2024-06-04", sets: 4, reps: 6, weight: 100 },
  { date: "2024-06-05", sets: 3, reps: 8, weight: 95 },
  { date: "2024-06-06", sets: 4, reps: 10, weight: 90 },
  { date: "2024-06-07", sets: 4, reps: 6, weight: 105 },
].map((entry) => ({
  ...entry,
  volume: entry.sets * entry.reps * entry.weight,
}));

const chartConfig = {
  volume: {
    label: "Volume (Sets × Reps × Weight)",
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

export function ChartLineInteractive() {
  const [activeMetric, setActiveMetric] =
    React.useState<keyof typeof chartConfig>("volume");

  const session = useSupabaseSession();

  const totals = React.useMemo(
    () => ({
      volume: workoutData.reduce((acc, cur) => acc + cur.volume, 0),
      reps: workoutData.reduce((acc, cur) => acc + cur.reps * cur.sets, 0),
      sets: workoutData.reduce((acc, cur) => acc + cur.sets, 0),
      weight: workoutData.reduce((acc, cur) => acc + cur.weight, 0),
    }),
    []
  );

  React.useEffect(() => {
    if (!session || !session.user) return;

    fetchUserExercises(session?.user.id);
  }, []);

  return (
    <>
      <Card className="py-4 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle>Workout Tracker</CardTitle>
            <CardDescription>Track training metrics over time</CardDescription>
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
              data={workoutData}
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
