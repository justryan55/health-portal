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
import { fetchWeeklyVolume } from "@/lib/workouts";
import { useProfile } from "@/providers/profile-provider";

export default function WeeklyVolumeSnapshot() {
  const [weeklyVolume, setWeeklyVolume] = useState(0);
  const [percentageChange, setPercentageChange] = useState<number | undefined>(
    undefined
  );
  const { profile } = useProfile();

  const getWeeklyVolume = async () => {
    try {
      const res = await fetchWeeklyVolume();

      if (!res?.success) {
        console.log("Error fetching weekly volume");
        return;
      }

      setWeeklyVolume(res?.weeklyVolume);

      const prevVolume = res.previousWeeklyVolume ?? 0;
      const currVolume = res.weeklyVolume;

      let percentage = 0;

      if (prevVolume === 0 && currVolume > 0) {
        percentage = 100;
      } else if (prevVolume > 0) {
        percentage = ((currVolume - prevVolume) / prevVolume) * 100;
      }

      setPercentageChange(percentage);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getWeeklyVolume();
  }, []);
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Avg. Weekly Volume</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {weeklyVolume} {profile.units === "metric" ? "kg" : "lb"}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {percentageChange !== undefined && percentageChange > 0 ? (
              <IconTrendingUp />
            ) : (
              <IconTrendingDown />
            )}
            {percentageChange !== undefined
              ? `${percentageChange.toFixed(1)}%`
              : "N/A"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Workload trending
          {percentageChange !== undefined
            ? percentageChange > 0
              ? " upwards"
              : " downwards"
            : ""}
          {percentageChange !== undefined ? (
            percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )
          ) : null}
        </div>

        <div className="text-muted-foreground">Sets × Reps × Weight</div>
      </CardFooter>
    </Card>
  );
}
