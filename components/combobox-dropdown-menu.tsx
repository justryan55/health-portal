"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteExercise } from "@/lib/workouts";

const labels = [
  "feature",
  "bug",
  "enhancement",
  "documentation",
  "design",
  "question",
  "maintenance",
];

export function ComboboxDropdownMenu({
  exercise,
  setIsEditing,
  setIsAddingSet,
  isAddingSet,
  onDeleteExercise,
}) {
  const [label, setLabel] = React.useState("feature");
  const [open, setOpen] = React.useState(false);

  const handleDeleteClick = async () => {
    const data = await deleteExercise(exercise);

    if (data) {
      onDeleteExercise(exercise.id);
    }
  };

  const handleEditClick = async () => {
    setIsEditing((prev) => ({ ...prev, bool: !prev.bool, exercise: exercise }));
  };

  const handleAddSetClick = () => {
    setIsAddingSet((prev) => {
      if (prev.bool && prev.exerciseId === exercise.id) {
        return { bool: false, exerciseId: null };
      }

      return { bool: true, exerciseId: exercise.id };
    });
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-white p-2 hover:bg-gray-100 rounded-lg transition-colors"
            size="sm"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            {!isAddingSet.bool ? (
              <DropdownMenuItem onClick={handleAddSetClick}>
                Add Set
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleAddSetClick}>
                Cancel Set
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
