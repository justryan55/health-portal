"use client";

import ProfileSettings from "@/components/profile-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserProfile } from "@/lib/profile";
import { useProfile } from "@/providers/profile-provider";
import { toast } from "sonner";

export default function Page() {
  const { profile } = useProfile();

  const saveChanges = async () => {
    const res = await updateUserProfile(profile);

    if (!res.success) {
      toast.error("Failed to update profile.");
      return;
    }

    toast("Profile has been updated.");
  };

  return (
    <div className="flex justify-center items-center py-6 px-2 w-full">
      {/* <Card>
        <ProfileCard />
      </Card> */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Make changes to your profile here.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              saveChanges();
            }}
          >
            Save changes
          </Button>
        </CardHeader>
        <ProfileSettings />
        {/* <CardFooter>
          <Button>Save changes</Button>
        </CardFooter> */}
      </Card>
    </div>
  );
}
