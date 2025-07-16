import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MonthlySessionsSnapshot from "./monthly-sessions-snapshot";
import WeeklyVolumeSnapshot from "./weekly-volume-snapshot";
import PersonalRecordSnapshot from "./personal-record-snapshot";
import AverageRPESnapshot from "./average-rpe-snapshot";
import GoalsSnapshot from "./goals-snapshot";

export function ProgressSnapshotCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs xl:px-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8 px-0! ">
      <MonthlySessionsSnapshot />
      <WeeklyVolumeSnapshot />
      {/* <PersonalRecordSnapshot /> */}
      <AverageRPESnapshot />
      <GoalsSnapshot />
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Body Weight</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            80 kg
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +1.2 kg
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Weekly average weight trend
          </div>
          <div className="text-muted-foreground">
            Helps contextualize performance
          </div>
        </CardFooter>
      </Card> */}
    </div>
  );
}
