import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useState } from "react";
import { nanoid } from "nanoid";
import { uploadExerciseToDB } from "@/lib/workouts";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function AddDailyExerciseDialog({ date }) {
  const [exercise, setExercise] = useState({
    _uid: nanoid(),
    name: "",
    set: [{ _uid: nanoid(), weight: "", reps: "" }],
  });

  const session = useSupabaseSession();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  const addSet = () => {
    setExercise((prev) => ({
      ...prev,
      set: [...prev.set, { _uid: nanoid(), weight: "", reps: "" }],
    }));
  };

  const uploadWorkout = async () => {
    const data = await uploadExerciseToDB(session, exercise, localDateISO);
    console.log(data);
  };

  const handleChange = (value) => {
    setExercise((prevExercise) => ({ ...prevExercise, name: value }));
  };

  const handleWeightChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.set];
      const updatedSetItem = { ...updatedSet[index], weight: value };
      updatedSet[index] = updatedSetItem;

      return { ...prev, set: updatedSet };
    });
  };

  const handleRepChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.set];
      const updatedSetItem = { ...updatedSet[index], reps: value };
      updatedSet[index] = updatedSetItem;

      return {
        ...prev,
        set: updatedSet,
      };
    });
  };

  return (
    <Dialog>
      {/* <p className="pb-2 text-center">
              No exercises completed on this date.
            </p> */}
      <DialogTrigger>
        <Button variant="outline">Add Exercise</Button>
      </DialogTrigger>

      <DialogContent className="w-9/12 max-w-xs sm:max-w-md sm:w-auto sm:max-w-none">
        <DialogHeader>
          {/* <DialogTitle>Exercise</DialogTitle> */}
          <DialogTitle>
            <Input
              type="text"
              placeholder="Exercise"
              className="w-full mt-4"
              onChange={(e) => handleChange(e.target.value)}
            />
          </DialogTitle>
        </DialogHeader>
        {exercise.set.map((set, index, exercise) => (
          <div key={set._uid} className="flex items-center space-x-2">
            <div className="flex flex-row gap-2">
              <Label className="mr-2">Set {index + 1}</Label>
              <Input
                className="max-w-18 mr-2"
                type="text"
                placeholder="Weight"
                onChange={(e) => handleWeightChange(e.target.value, index)}
              />
              <Input
                className="max-w-18"
                type="text"
                placeholder="Reps"
                onChange={(e) => handleRepChange(e.target.value, index)}
              />
            </div>
            {index + 1 === exercise.length && (
              <Button onClick={() => addSet()} size="sm" className="px-3">
                <span className="sr-only">Add Set</span>
                <Plus />
              </Button>
            )}
          </div>
        ))}
        <DialogFooter className="flex flex-row justify-evenly">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={uploadWorkout}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
