"use client";

import ProfileCard from "@/components/profile-card";
import ProfileSettings from "@/components/profile-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserProfile } from "@/lib/profile";
import { useProfile } from "@/providers/profile-provider";
import { toast } from "sonner";

export default function Page() {
  const { profile, setProfile } = useProfile();

  const saveChanges = async () => {
    const res = await updateUserProfile(profile);

    if (!res.success) {
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
