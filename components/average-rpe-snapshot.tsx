import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { fetchWeeklyRPE } from "@/lib/workouts";

export default function AverageRPESnapshot() {
  const [averageWeeklyRPE, setAverageWeeklyRPE] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  const getWeeklyRPE = async () => {
    try {
      const res = await fetchWeeklyRPE();

      if (!res?.success) {
        return;
      }

      setAverageWeeklyRPE(res.weeklyRPE);

      const lastWeekRPE = res?.previousWeeklyRPE;
      const currentWeekRPE = res?.weeklyRPE;

      const percentage =
        lastWeekRPE > 0
          ? ((currentWeekRPE - lastWeekRPE) / lastWeekRPE) * 100
          : currentWeekRPE > 0
          ? 100
          : 0;

      setPercentageChange(percentage);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getWeeklyRPE();
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Average Weekly RPE</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {averageWeeklyRPE}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className="flex items-center gap-1">
            {percentageChange > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
            {percentageChange}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Training intensity is trending
          {percentageChange > 0 ? " upwards" : " downwards"}
          {percentageChange > 0 ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground">
          Shows average perceived exertion across workouts this week
        </div>
      </CardFooter>
    </Card>
  );
}
