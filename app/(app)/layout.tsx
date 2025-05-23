import type { Metadata } from "next";
import "../globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { UserProvider } from "../../providers/user-provider";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase/supabase-server";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { WorkoutProvider } from "@/providers/workout-provider";
import { DateProvider } from "@/providers/date-provider";

export const metadata: Metadata = {
  title: "Forge Health Portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <DateProvider>
            <UserProvider>
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
                  </SidebarInset>
                </SidebarProvider>
              </WorkoutProvider>
            </UserProvider>
          </DateProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
