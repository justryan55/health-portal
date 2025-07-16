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
import { fetchSessionsThisMonth } from "@/lib/workouts";
import { toast } from "sonner";

type SessionType = {
  id: string;
  user: string;
  date: string;
  is_deleted: boolean;
};

export default function MonthlySessionsSnapshot() {
  const [monthlySessions, setMonthlySessions] = useState<SessionType[]>([]);
  const [percentageChange, setPercentageChange] = useState<number | undefined>(
    undefined
  );

  const fetchMonthlySesssions = async () => {
    try {
      const res = await fetchSessionsThisMonth();

      if (!res?.success) {
        toast.error("Unable to fetch monthly sessions.");
        console.log("Error", res?.message);
        return;
      }

      setMonthlySessions(res.currentMonth ?? []);

      const lastMonthCount = res?.lastMonth?.length || 0;
      const currentMonthCount = res?.currentMonth?.length || 0;

      const percentage =
        lastMonthCount > 0
          ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
          : currentMonthCount > 0
          ? 100
          : 0;

      setPercentageChange(percentage);
    } catch (err) {
      toast.error("There has been an error.");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMonthlySesssions();
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Monthly Sessions</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {monthlySessions.length} sessions
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
          Avg. Time per Session: 52m
          {/* <IconTrendingUp className="size-4" /> */}
        </div>
        <div className="text-muted-foreground">Consistent training pace</div>
      </CardFooter>
    </Card>
  );
}
