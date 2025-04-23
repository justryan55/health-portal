"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { muscle: "Chest", sets: 28, fill: "var(--color-chest)" },
  { muscle: "Back", sets: 24, fill: "var(--color-back)" },
  { muscle: "Legs", sets: 32, fill: "var(--color-legs)" },
  { muscle: "Shoulders", sets: 18, fill: "var(--color-shoulders)" },
  { muscle: "Arms", sets: 20, fill: "var(--color-arms)" },
  { muscle: "Core", sets: 12, fill: "var(--color-core)" },
];

const chartConfig = {
  sets: {
    label: "Sets",
  },
  chest: {
    label: "Chest",
    color: "hsl(var(--chart-1))",
  },
  back: {
    label: "Back",
    color: "hsl(var(--chart-2))",
  },
  legs: {
    label: "Legs",
    color: "hsl(var(--chart-3))",
  },
  shoulders: {
    label: "Shoulders",
    color: "hsl(var(--chart-4))",
  },
  arms: {
    label: "Arms",
    color: "hsl(var(--chart-5))",
  },
  core: {
    label: "Core",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig;

export function ChartPie() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="sets" nameKey="muscle" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
