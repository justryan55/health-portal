"use client";

import { ColumnDef } from "@tanstack/react-table";

export type ColumnProps = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

export const snapshotColumns: ColumnDef<ColumnProps>[] = [
  {
    accessorKey: "exercise",
    header: "Exercise",
  },
  {
    accessorKey: "sets",
    header: "Sets",
  },
  {
    accessorKey: "reps",
    header: "Reps",
  },
  {
    accessorKey: "weight",
    header: "Weight",
  },
];
