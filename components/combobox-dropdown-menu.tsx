"use client";

import * as React from "react";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteExercise } from "@/lib/workouts";

interface Exercise {
  id: string;
}

interface ComboboxDropdownMenuProps {
  exercise: Exercise;
  setIsEditing: React.Dispatch<
    React.SetStateAction<{ bool: boolean; exercise: Exercise }>
  >;
  setIsAddingSet: React.Dispatch<
    React.SetStateAction<{ bool: boolean; exerciseId: string | null }>
  >;
  isAddingSet: { bool: boolean; exerciseId: string | null };
  onDeleteExercise: (id: string) => void;
}

export function ComboboxDropdownMenu({
  exercise,
  setIsEditing,
  setIsAddingSet,
  isAddingSet,
  onDeleteExercise,
}: ComboboxDropdownMenuProps) {
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
    setIsAddingSet((prev: { bool: boolean; exerciseId: string | null }) => {
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
            {isAddingSet.bool && isAddingSet.exerciseId === exercise.id ? (
              <DropdownMenuItem onClick={handleAddSetClick}>
                Cancel Set
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleAddSetClick}>
                <Plus className="w-4 h-4" />
                Add Set
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit className="w-4 h-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-red-600"
            >
              <Trash2 className="text-red w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
