"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SectionCards } from "@/components/section-cards";
import { fetchUserProfile } from "@/lib/profile";
import { useEffect, useState } from "react";

export default function Page() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);

  const isFirstTime = async () => {
    const res = await fetchUserProfile();

    if (!res.success) {
      console.log(res.message);
      return;
    }

    const onboardingComplete = res.data?.onboarding_complete;
    setShowOnboardingModal(onboardingComplete);
  };

  useEffect(() => {
    isFirstTime();
  }, []);
  return (
    <>
      {!showOnboardingModal && <OnboardingModal />}
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
