// import {
//   Card,
//   CardAction,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useProfile } from "@/providers/profile-provider";

// export default function GoalsSnapshot() {
//   const { profile } = useProfile();

//   const availableGoals = [
//     { id: "goal-weight-loss", label: "Lose weight", value: "weight-loss" },
//     { id: "goal-muscle-gain", label: "Build muscle", value: "muscle-gain" },
//     { id: "goal-endurance", label: "Improve endurance", value: "endurance" },
//     {
//       id: "goal-flexibility",
//       label: "Increase flexibility",
//       value: "flexibility",
//     },
//     {
//       id: "goal-overall-health",
//       label: "General health",
//       value: "overall-health",
//     },
//     {
//       id: "goal-mental-health",
//       label: "Improve mental health",
//       value: "mental-health",
//     },
//   ];

//   const goalLabelMap = Object.fromEntries(
//     availableGoals.map((goal) => [goal.value, goal.label])
//   );

//   const formattedGoals = profile.goals
//     .filter((goal) => goal !== "other")
//     .map((goal) => goalLabelMap[goal] || goal);

//   return (
//     <Card className="@container/card">
//       <CardHeader>
//         <CardDescription>Your Focus Areas</CardDescription>
//         <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
//           Current Goals
//         </CardTitle>
//         <CardAction />
//       </CardHeader>
//       <CardFooter className="flex-col items-start gap-1.5 text-sm">
//         <div className="line-clamp-1 flex gap-2 font-medium">
//           {formattedGoals.length > 0 ? (
//             <ul className="list-disc pl-4">
//               {formattedGoals.map((goal) => (
//                 <li key={goal}>{goal}</li>
//               ))}
//             </ul>
//           ) : (
//             "No goals set"
//           )}
//         </div>

//         {/* <div className="text-muted-foreground">
//           Tracking goals helps personalize your recommendations.
//         </div> */}
//       </CardFooter>
//     </Card>
//   );
// }

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/providers/profile-provider";
import { useState } from "react";

export default function GoalsSnapshot() {
  const profileContext = useProfile();
  const profile = profileContext?.profile;
  const [expanded, setExpanded] = useState(false);

  const availableGoals = [
    { id: "goal-weight-loss", label: "Lose weight", value: "weight-loss" },
    { id: "goal-muscle-gain", label: "Build muscle", value: "muscle-gain" },
    { id: "goal-endurance", label: "Improve endurance", value: "endurance" },
    {
      id: "goal-flexibility",
      label: "Increase flexibility",
      value: "flexibility",
    },
    {
      id: "goal-overall-health",
      label: "General health",
      value: "overall-health",
    },
    {
      id: "goal-mental-health",
      label: "Improve mental health",
      value: "mental-health",
    },
  ];

  const goalLabelMap = Object.fromEntries(
    availableGoals.map((goal) => [goal.value, goal.label])
  );

  const formattedGoals =
    profile?.goals
      ?.filter((goal: string) => goal !== "other")
      .map((goal: string) => goalLabelMap[goal] || goal) ?? [];

  const maxVisibleGoals = 3;
  const visibleGoals = expanded
    ? formattedGoals
    : formattedGoals.slice(0, maxVisibleGoals);

  const hiddenCount = formattedGoals.length - maxVisibleGoals;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Your Focus Areas</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          Current Goals
        </CardTitle>
        <CardAction />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {formattedGoals.length > 0 ? (
            <ul className="list-disc pl-4">
              {visibleGoals.map((goal: string) => (
                <li key={goal}>{goal}</li>
              ))}
              {hiddenCount > 0 && (
                <li className="list-none">
                  <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-muted-foreground underline underline-offset-2 hover:text-primary cursor-pointer"
                  >
                    {!expanded ? `+${hiddenCount} more` : `Show less`}
                  </button>
                </li>
              )}
            </ul>
          ) : (
            "No goals set"
          )}
        </div>

        {/* <div className="text-muted-foreground">
          Tracking goals helps personalize your recommendations.
        </div> */}
      </CardFooter>
    </Card>
  );
}
