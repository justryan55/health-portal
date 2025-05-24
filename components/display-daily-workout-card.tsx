import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

import { nanoid } from "nanoid";
import { useSupabaseSession } from "@/providers/supabase-provider";
import { fetchDailyWorkout } from "@/lib/workouts";
import { useDate } from "@/providers/date-provider";
import { Separator } from "./ui/separator";
import AddDailyExerciseDialog from "./add-daily-exercise-dialog";
import { Check, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

export default function DisplayDailyWorkoutCard() {
  const [exercises, setExercises] = useState();

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
  const session = useSupabaseSession();
  const { date } = useDate();
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  const localDateISO = new Date(localTimeMs).toISOString();

  const getExerciseInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const checkIfWorkoutForDate = async () => {
      const data = await fetchDailyWorkout(session, localDateISO);
      console.log("3", data);
      if (!data) {
        return setHasStoredWorkout(false);
      }

      setHasStoredWorkout(true);
      setExercises(data);
      console.log("HEre", data);
      console.log("date", date);
    };

    checkIfWorkoutForDate();
  }, [session, localDateISO]);

  return (
    <div className="w-full">
      {!isCreatingWorkout && !hasStoredWorkout ? (
        // <div className="flex flex-col justify-center min-h-72">
        //   <p className="w-full text-center pb-2">
        //     No exercises completed on this date.
        //   </p>
        //   <AddDailyExerciseDialog date={date} />
        // </div>

        <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-center space-y-4">
            {/* <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div> */}
            <p className="text-gray-600 font-medium">
              No exercises completed on this date.
            </p>
            <p className="text-gray-500 text-sm">
              Start your workout by adding your first exercise!
            </p>
          <AddDailyExerciseDialog date={date} />
          </div>
        </div>
      ) : (
        // <div className="flex justify-between items-center">
        //   <h1 className="pl-5">
        //     {date.toDateString()}
        //     {/* Exercises completed on {date.toDateString()} */}
        //   </h1>
        //   <AddDailyExerciseDialog date={date} />
        // </div>

        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white">Today's Workout</h1>
            <p className="text-gray-300 font-medium">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <AddDailyExerciseDialog date={date} />
        </div>
      )}

      <div className="flex flex-col w-full mt-4 justify-center sm:pl-4 sm:justify-start">
        <div className="space-y-6">
          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasStoredWorkout &&
              exercises?.map((exercise) => (
                <Card
                  key={nanoid()}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-black" />

                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {" "}
                          {getExerciseInitials(exercise.name)}
                        </div>
                        <h3 className="text-l font-bold text-gray-800">
                          {exercise.name}
                        </h3>
                      </div>
                      {/* Options menu */}
                      <Button className="bg-white p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </Button>
                    </div>
                    {/* <Separator orientation="horizontal" /> */}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {exercise.sets.map((set, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[60px_1fr_1fr_40px] gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-center">
                          <span className="inline-block bg-white text-gray-600 font-semibold text-sm px-3 py-1 rounded-lg">
                            Set {index + 1}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                            Reps
                          </div>
                          <div className="text-md font-bold text-gray-800">
                            {set.reps}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                            Weight
                          </div>
                          <div className="text-md font-bold text-gray-800">
                            {set.weight}
                          </div>
                        </div>

                        {/* <div className="flex justify-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div> */}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}{" "}
          </div>
          {!hasStoredWorkout && (
            <div className="border-t border-gray-200 mb-5" />
          )}

          {/* <div className="max-h-72 overflow-scroll">
          {hasStoredWorkout && (
            <>
              {exercises?.map((exercise) => (
                <Card
                  key={nanoid()}
                  className="min-w-full mt-2 flex items-start"
                >
                  <div className="flex flex-row justify-between w-full">
                    <div>
                      <CardHeader className="pr-24 mr-2 whitespace-nowrap">
                        {exercise.name}
                      </CardHeader>
                      <div>
                        <Separator orientation="vertical" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {exercise.sets.map((set, index) => (
                        <CardContent
                          key={index}
                          className="flex flex-row gap-2"
                        >
                          <CardDescription>Set {index + 1}</CardDescription>
                          <CardDescription>Reps: {set.reps}</CardDescription>
                          <CardDescription>
                            Weight: {set.weight}
                          </CardDescription>
                        </CardContent>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )} */}
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
// import { nanoid } from "nanoid";
// import { useSupabaseSession } from "@/providers/supabase-provider";
// import { fetchDailyWorkout } from "@/lib/workouts";
// import { useDate } from "@/providers/date-provider";
// import { Separator } from "./ui/separator";
// import AddDailyExerciseDialog from "./add-daily-exercise-dialog";
// import { Check, MoreHorizontal } from "lucide-react";

// export default function DisplayDailyWorkoutCard() {
//   const [exercises, setExercises] = useState();
//   const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
//   const [hasStoredWorkout, setHasStoredWorkout] = useState(false);
//   const session = useSupabaseSession();
//   const { date } = useDate();

//   const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
//   const localDateISO = new Date(localTimeMs).toISOString();

//   useEffect(() => {
//     const checkIfWorkoutForDate = async () => {
//       const data = await fetchDailyWorkout(session, localDateISO);
//       console.log("3", data);
//       if (!data) {
//         return setHasStoredWorkout(false);
//       }
//       setHasStoredWorkout(true);
//       setExercises(data);
//       console.log("HEre", data);
//       console.log("date", date);
//     };
//     checkIfWorkoutForDate();
//   }, [session, localDateISO]);

//   // Helper function to get exercise initials
//   const getExerciseInitials = (name) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Calculate workout summary
//   const getWorkoutSummary = () => {
//     if (!exercises) return { totalExercises: 0, totalSets: 0 };

//     const totalExercises = exercises.length;
//     const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

//     return { totalExercises, totalSets };
//   };

//   const { totalExercises, totalSets } = getWorkoutSummary();

//   return (
//     <div className="w-full space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
//         <div>
//           <h1 className="text-2xl font-bold">Today's Workout</h1>
//           <p className="text-blue-100 font-medium">
//             {date.toLocaleDateString('en-US', {
//               weekday: 'long',
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric'
//             })}
//           </p>
//         </div>
//         <AddDailyExerciseDialog date={date} />
//       </div>

//       {/* No workout state */}
//       {!isCreatingWorkout && !hasStoredWorkout ? (
//         <div className="flex flex-col justify-center items-center min-h-72 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
//           <div className="text-center space-y-4">
//             <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
//               <span className="text-2xl">💪</span>
//             </div>
//             <p className="text-gray-600 font-medium">
//               No exercises completed on this date.
//             </p>
//             <p className="text-gray-500 text-sm">
//               Start your workout by adding your first exercise!
//             </p>
//           </div>
//         </div>
//       ) : (
//         /* Workout content */
//         <div className="space-y-6">
//           {/* Exercise Cards Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {hasStoredWorkout && exercises?.map((exercise) => (
//               <Card
//                 key={nanoid()}
//                 className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl"
//               >
//                 {/* Gradient accent bar */}
//                 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

//                 {/* Card Header */}
//                 <CardHeader className="pb-4">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                       {/* Exercise Icon */}
//                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
//                         {getExerciseInitials(exercise.name)}
//                       </div>
//                       <h3 className="text-xl font-bold text-gray-800">
//                         {exercise.name}
//                       </h3>
//                     </div>
//                     {/* Options menu */}
//                     <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                       <MoreHorizontal className="w-5 h-5 text-gray-400" />
//                     </button>
//                   </div>
//                 </CardHeader>

//                 {/* Sets Container */}
//                 <CardContent className="space-y-3 pt-0">
//                   {exercise.sets.map((set, index) => (
//                     <div
//                       key={index}
//                       className="grid grid-cols-[60px_1fr_1fr_40px] gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
//                     >
//                       {/* Set Number */}
//                       <div className="text-center">
//                         <span className="inline-block bg-white text-gray-600 font-semibold text-sm px-3 py-1 rounded-lg">
//                           Set {index + 1}
//                         </span>
//                       </div>

//                       {/* Reps */}
//                       <div className="text-center">
//                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
//                           Reps
//                         </div>
//                         <div className="text-lg font-bold text-gray-800">
//                           {set.reps}
//                         </div>
//                       </div>

//                       {/* Weight */}
//                       <div className="text-center">
//                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
//                           Weight
//                         </div>
//                         <div className="text-lg font-bold text-gray-800">
//                           {set.weight}
//                         </div>
//                       </div>

//                       {/* Checkmark */}
//                       <div className="flex justify-center">
//                         <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
//                           <Check className="w-4 h-4 text-white" />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Workout Summary */}
//           {hasStoredWorkout && (
//             <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl">
//               <CardContent className="p-8 text-center">
//                 <h2 className="text-2xl font-bold mb-6">Workout Complete! 🎉</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
//                     <div className="text-3xl font-bold mb-2">{totalExercises}</div>
//                     <div className="text-sm opacity-90">Exercises</div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
//                     <div className="text-3xl font-bold mb-2">{totalSets}</div>
//                     <div className="text-sm opacity-90">Total Sets</div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
//                     <div className="text-3xl font-bold mb-2">45m</div>
//                     <div className="text-sm opacity-90">Duration</div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
//                     <div className="text-3xl font-bold mb-2">420</div>
//                     <div className="text-sm opacity-90">Calories</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
