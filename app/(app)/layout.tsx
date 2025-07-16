"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { UserProvider } from "../../providers/user-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { WorkoutProvider } from "@/providers/workout-provider";
import { DateProvider } from "@/providers/date-provider";
import ProfileProvider from "@/providers/profile-provider";
import { Toaster } from "sonner";
import { supabase } from "@/lib/supabase/supabase-client";
import Image from "next/image";
import spinnerBlack from "@/public/spinner-black.svg";

export default function RootClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (!data.user) {
        router.push("/auth/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push("/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src={spinnerBlack} alt="loading-spinner" />
      </div>
    );

  if (!user) return null;

  return (
    <SupabaseProvider>
      <DateProvider>
        <UserProvider>
          <ProfileProvider>
            <WorkoutProvider>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                <AppSidebar variant="inset" />
                <SidebarInset>
                  <SiteHeader />
                  {children}
                  <Toaster />
                </SidebarInset>
              </SidebarProvider>
            </WorkoutProvider>
          </ProfileProvider>
        </UserProvider>
      </DateProvider>
    </SupabaseProvider>
  );
}
