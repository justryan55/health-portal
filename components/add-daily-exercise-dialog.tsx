import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { useState } from "react";
import { nanoid } from "nanoid";
import { uploadExerciseToDB } from "@/lib/workouts";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";

export default function AddDailyExerciseDialog({ date }) {
  const [exercise, setExercise] = useState({
    _uid: nanoid(),
    name: "",
    sets: [{ _uid: nanoid(), weight: "", reps: "" }],
  });

  const session = useSupabaseSession();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  const addSet = () => {
    setExercise((prev) => ({
      ...prev,
      sets: [...prev.sets, { _uid: nanoid(), weight: "", reps: "" }],
    }));
  };

  const uploadWorkout = async () => {
    const data = await uploadExerciseToDB(session, exercise, localDateISO);
    console.log(data);
  };

  const handleDeleteClick = (index: number) => {
    setExercise((prev) => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (value) => {
    setExercise((prevExercise) => ({ ...prevExercise, name: value }));
  };

  const handleWeightChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.sets];
      const updatedSetItem = { ...updatedSet[index], weight: value };
      updatedSet[index] = updatedSetItem;

      return { ...prev, sets: updatedSet };
    });
  };

  const handleRepChange = (value, index) => {
    setExercise((prev) => {
      const updatedSet = [...prev.sets];
      const updatedSetItem = { ...updatedSet[index], reps: value };
      updatedSet[index] = updatedSetItem;

      return {
        ...prev,
        sets: updatedSet,
      };
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline" className="text-black">
          Add Exercise
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border-0 shadow-2xl md:max-w-1xl box-border mx-auto">
        <DialogHeader className="space-y-6 p-6 pt-1 md:p-6 text-black rounded-t-2xl pb-0 md:pb-0">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Exercise"
              className="text-center font-semibold text-sm md:text-xl"
              onChange={(e) => handleChange(e.target.value)}
            />
          </div>
        </DialogHeader>

        <Separator orientation="horizontal" />

        <div className="p-6 overflow-y-auto max-h-[50vh] pt-0 space-y-4 ">
          {exercise.sets.map((set, index, array) => (
            <Card
              key={set._uid}
              className="border border-gray-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden border-none py-0 shadow-none "
            >
              <CardContent className="p-4 pt-0 pb-4 md:pb-1">
                <div className="grid grid-cols-5 gap-4 items-end">
                  <div>
                    <Label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                      Set {index + 1}
                    </Label>
                  </div>

                  <div className="flex gap-2 items-end col-span-3">
                    <div>
                      <Label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                        Weight
                      </Label>
                      <Input
                        type="text"
                        placeholder="Weight"
                        value={set.weight}
                        onChange={(e) =>
                          handleWeightChange(e.target.value, index)
                        }
                        className="rounded-lg border-gray-200 max-w-full"
                      />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                        Reps
                      </Label>
                      <Input
                        type="text"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleRepChange(e.target.value, index)}
                        className="rounded-lg border-gray-200 max-w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between sm:justify-auto">
                    <div>
                      {(array || []).length > 1 ? (
                        <Button
                          onClick={() => handleDeleteClick(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2"
                        >
                          <Trash2 className="w-4 h-4  sm:mr-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={addSet}
                          size="sm"
                          className="px-3 max-w-max"
                        >
                          <span className="sr-only">Add Set</span>
                          <Plus />
                        </Button>
                      )}
                    </div>
                    {index + 1 === array.length && (array || []).length > 1 && (
                      <Button
                        onClick={addSet}
                        size="sm"
                        className="px-3 max-w-max"
                      >
                        <span className="sr-only">Add Set</span>
                        <Plus />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex justify-between w-full gap-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="rounded-xl px-6 py-2 font-medium border-gray-200 hover:bg-gray-100"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={uploadWorkout}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
