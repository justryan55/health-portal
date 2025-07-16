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
import { fetchPersonalRecords } from "@/lib/workouts";

export default function PersonalRecordSnapshot() {
  // const getPersonalRecords = async () => {
  //   try {
  //     const res = await fetchPersonalRecords();

  //     if (!res?.success) {
  //       console.log("Error", res?.message);
  //       return;
  //     }

  //     console.log(res);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // useEffect(() => {
  //   getPersonalRecords();
  // }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Most Improved Lift</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          Bench Press
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +15%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Lift with highest recent growth
          <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Indicates consistent progress over time
        </div>
      </CardFooter>
    </Card>
  );
}
