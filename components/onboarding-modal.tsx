"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProfileSettings from "./profile-settings";
import { useUser } from "@/providers/user-provider";
import { useEffect, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Card } from "./ui/card";
import { useProfile } from "@/providers/profile-provider";
import { updateOnboardingStatus, updateUserProfile } from "@/lib/profile";
import { toast } from "sonner";

export function OnboardingModal() {
  const { user } = useUser();
  const { profile } = useProfile();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (!user?.onboardingCompleted) {
      setShowOnboardingModal(true);
    }
  }, [user]);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkip = async () => {
    await updateOnboardingStatus();
    setShowOnboardingModal(false);
  };

  const completeOnboarding = async () => {
    const res = await updateUserProfile(profile);

    if (!res.success) {
      return;
    }

    await updateOnboardingStatus();
    toast("Profile has been updated.");
    setShowOnboardingModal(false);
  };

  return (
    <Dialog open={showOnboardingModal} onOpenChange={setShowOnboardingModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 && "Getting Started"}
            {currentStep === 2 && "Explore the Portal"}
            {currentStep === 3 && "Set Up Your Profile"}
          </DialogTitle>
        </DialogHeader>
        <Card>
          {currentStep === 1 && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">
                Welcome {user.fullName},
              </h2>

              <p className="text-sm text-muted-foreground">
                We&apos;re excited to have you here. Let&apos;s take a moment to
                set up your profile so you can get the most out of the portal.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Sections Overview</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Here’s a quick overview of the main sections you’ll use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>Dashboard:</strong> Your personalized home screen with
                  key stats.
                </li>
                <li>
                  <strong>Workouts:</strong> Plan, track, and log your exercises
                  and training.
                </li>
                <li>
                  <strong>Progress:</strong> Visualize your fitness journey over
                  time.
                </li>
                <li>
                  <strong>Profile Settings:</strong> Manage your personal info
                  and preferences.
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Let’s continue to set up your profile to tailor the experience
                just for you.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <ProfileSettings />
            </div>
          )}
        </Card>
        <DialogFooter
          className={`flex ${
            currentStep === 1 ? "flex-end" : "justify-between!"
          }`}
        >
          {currentStep > 1 && currentStep < 3 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            currentStep === 3 && (
              <DialogClose asChild>
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              </DialogClose>
            )
          )}

          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={() => completeOnboarding()}>
              Complete Profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
