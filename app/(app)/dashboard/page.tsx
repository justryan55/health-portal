// "use client";

// import { OnboardingModal } from "@/components/onboarding-modal";
// import { ProgressSnapshotCards } from "@/components/progress-snapshop-cards";
// import { fetchUserProfile } from "@/lib/profile";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// export default function Page() {
//   const [showOnboardingModal, setShowOnboardingModal] = useState(true);

//   const isFirstTime = async () => {
//     const res = await fetchUserProfile();

//     if (!res.success) {
//       toast.error("Failed to fetch user profile.");

//       console.log(res.message);

//       return;
//     }

//     const onboardingComplete = res.data?.onboarding_complete;
//     setShowOnboardingModal(onboardingComplete);
//   };

//   useEffect(() => {
//     isFirstTime();
//   }, []);
//   return (
//     <>
//       {!showOnboardingModal && <OnboardingModal />}
//       <div className="flex flex-1 flex-col">
//         <div className="@container/main flex flex-1 flex-col gap-2">
//           <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//             {/* <SectionCards /> */}
//             <div className="px-4 lg:px-6">
//               <ProgressSnapshotCards />
//             </div>
//             {/* <div className="px-4 lg:px-6">
//               <ChartAreaInteractive />
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
