import { ChartLine } from "@/components/line-chart";
import { ColumnProps, snapshotColumns } from "./tables/snapshot-columns";

import { SnapshotTable } from "./tables/snapshot-table";
import { Card, CardTitle } from "@/components/ui/card";
import { ChartPie } from "@/components/pie-chart";

async function getData(): Promise<ColumnProps[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      exercise: "Deadlift",
      sets: 5,
      reps: 5,
      weight: 100,
    },
    {
      id: "728ed52f",
      exercise: "Lat Pulldown",
      sets: 3,
      reps: 10,
      weight: 26,
    },
    {
      id: "728ed52f",
      exercise: "Cable Row",
      sets: 3,
      reps: 10,
      weight: 14,
    },
    {
      id: "728ed52f",
      exercise: "Face Pull",
      sets: 5,
      reps: 15,
      weight: 20,
    },
    {
      id: "728ed52f",
      exercise: "Hammer Curl",
      sets: 4,
      reps: 12,
      weight: 12,
    },
    {
      id: "728ed52f",
      exercise: "DB Curl",
      sets: 4,
      reps: 12,
      weight: 12,
    },
  ];
}

export default async function page() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="font-bold mb-2">Today's Workout</h1>
      <div className="mb-6">
        <SnapshotTable columns={snapshotColumns} data={data} />
      </div>
      <div className="flex flex-row gap-8">
        <div className="flex-1">
          <ChartLine />
          {/* <Calendar /> */}
        </div>
        <div className="flex-1 ">
          <Card className="h-full  px-6">
            <CardTitle>Last Monday's Workout</CardTitle>
            <div className="mb-6 ">
              <SnapshotTable columns={snapshotColumns} data={data} />
            </div>
          </Card>
        </div>
        <div className="flex-1">
          <ChartPie />
        </div>
      </div>
    </div>
  );
}
