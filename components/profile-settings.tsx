"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/providers/user-provider";
import { useEffect, useState } from "react";
import { useProfile } from "@/providers/profile-provider";

export default function ProfileSettings() {
  const { user } = useUser();
  const { profile, setProfile } = useProfile();
  const [customGoal, setCustomGoal] = useState("");

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

    // { id: "other", label: "Other", value: "other" },
  ];

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      fullName: user.fullName || "",
    }));
  }, [user.fullName, setProfile]);

  return (
    <>
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"> */}
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="tabs-demo-name">Name</Label>
            <Input
              value={`${user.fullName}`}
              onChange={(e) => {
                const updatedName =
                  e.target.value === "" ? "" : String(e.target.value);
                setProfile((prev) => ({
                  ...prev,
                  fullName: updatedName,
                }));
              }}
            />
          </div>
          {/* <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">Username</Label>
                <Input id="tabs-demo-username" value="@peduarte" />
              </div> */}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="grid gap-3">
              <Label htmlFor="profile-age">Age</Label>
              <Input
                type="number"
                value={profile.age ?? ""}
                placeholder="Enter your age"
                onChange={(e) => {
                  const age =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setProfile((prev) => ({
                    ...prev,
                    age: age,
                  }));
                }}
              />
            </div>

            {profile.units === "metric" ? (
              <div className="grid gap-3">
                <Label htmlFor="profile-height-cm">Height (cm)</Label>
                <Input
                  type="number"
                  id="profile-height-cm"
                  value={profile.height.cm}
                  placeholder="Enter your height in cm"
                  onChange={(e) => {
                    const height =
                      e.target.value === "" ? "" : Number(e.target.value);
                    setProfile((prev) => ({
                      ...prev,
                      height: {
                        ...prev.height,
                        cm: height,
                      },
                    }));
                  }}
                />
              </div>
            ) : (
              <div className="grid gap-3">
                <Label>Height (ft / in)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    id="profile-height-ft"
                    value={profile.height.ft}
                    placeholder="ft"
                    onChange={(e) => {
                      const ft =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setProfile((prev) => ({
                        ...prev,
                        height: {
                          ...prev.height,
                          ft: ft,
                        },
                      }));
                    }}
                  />
                  <Input
                    type="number"
                    id="profile-height-in"
                    value={profile.height.in}
                    placeholder="in"
                    onChange={(e) => {
                      const inch =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setProfile((prev) => ({
                        ...prev,
                        height: {
                          ...prev.height,
                          in: inch,
                        },
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="profile-weight">
                Weight ({profile.units === "metric" ? "kg" : "lb"})
              </Label>
              <Input
                type="number"
                id="profile-weight"
                value={profile.weight ?? ""}
                placeholder="Enter your weight"
                onChange={(e) => {
                  const weight =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setProfile((prev) => ({
                    ...prev,
                    weight: weight,
                  }));
                }}
              />
            </div>
          </div>

          <Label htmlFor="profile-gender">Gender</Label>
          <RadioGroup
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            value={profile.gender || "unspecified"}
            onValueChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                gender: value,
              }))
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unspecified" id="unspecified" />
              <Label htmlFor="unspecified">Prefer not to say</Label>
            </div>
          </RadioGroup>

          <div className="grid gap-3">
            <Label htmlFor="profile-goals">Goals</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableGoals.map((goal) => {
                const isOther = goal.value === "other";

                return (
                  <div
                    key={goal.id}
                    className={
                      isOther
                        ? "col-span-1 sm:col-span-2 flex flex-col gap-1"
                        : "flex flex-col gap-1"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={goal.id}
                        checked={profile.goals.includes(goal.value)}
                        onCheckedChange={(checked) => {
                          setProfile((prev) => {
                            let updatedGoals = checked
                              ? [...prev.goals, goal.value]
                              : prev.goals.filter(
                                  (g) => g !== goal.value && g !== customGoal
                                );

                            if (!checked && goal.value === "other") {
                              setCustomGoal("");
                            }

                            return {
                              ...prev,
                              goals: updatedGoals,
                            };
                          });
                        }}
                      />
                      <Label htmlFor={goal.id}>{goal.label}</Label>
                    </div>

                    {isOther && profile.goals.includes("other") && (
                      <Input
                        className="px-6 pt-1"
                        placeholder="Enter your goal"
                        value={customGoal}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomGoal(value);
                          setProfile((prev) => {
                            const cleanedGoals = prev.goals.filter(
                              (g) =>
                                g !== customGoal && g !== value && g !== "other"
                            );
                            return {
                              ...prev,
                              goals: ["other", ...cleanedGoals, value].filter(
                                Boolean
                              ),
                            };
                          });
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="profile-units">Preferred Units</Label>
            <RadioGroup
              id="profile-units"
              value={profile.units || "metric"}
              onValueChange={(value) => {
                setProfile((prev) => ({
                  ...prev,
                  units: value,
                }));
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric">Metric (kg, cm)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial">Imperial (lb, ft/in)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        {/* <CardFooter>
          <Button>Save changes</Button>
        </CardFooter> */}
        {/* </TabsContent>
        <TabsContent value="account"> */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your email and password here.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={user.email} disabled />
            </div>

            <div className="flex flex-row  justify-between gap-3">
              <div className="grid gap-1">
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Last changed 3 months ago
                </p>
              </div>

              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button variant="outline">Change</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current and new password to update your
                        credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="account-current-password">
                          Current password
                        </Label>
                        <Input id="account-current-password" type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="account-new-password">
                          New password
                        </Label>
                        <Input id="account-new-password" type="password" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>
          </CardContent>
        </Card> */}
        {/* </TabsContent> */}
        {/* </Tabs> */}
      </div>
    </>
  );
}
