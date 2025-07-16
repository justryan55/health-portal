"use client";

import * as React from "react";
import {
  // IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  // IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconGraph,
  // IconUsers,
} from "@tabler/icons-react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
// import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Workouts",
      url: "/workouts",
      icon: IconListDetails,
    },
    // {
    //   title: "Nutrition",
    //   url: "/nutrition",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Habits",
    //   url: "/habits",
    //   icon: IconFolder,
    // },
    // {
    //   title: "Journal",
    //   url: "/journal",
    //   icon: IconUsers,
    // },
    {
      title: "Progress",
      url: "/progress",
      icon: IconGraph,
    },
    // {
    //   title: "Coach (AI Assistant)",
    //   url: "/coach",
    //   icon: IconDatabase,
    // },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Health Library",
      url: "/library",
      icon: IconDatabase,
    },
    {
      name: "Progress Reports",
      url: "/reports",
      icon: IconReport,
    },
    {
      name: "Vision Board",
      url: "/vision",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isNative = Capacitor.isNativePlatform();

  return (
    <Sidebar
      className={isNative ? "native-padding" : ""}
      collapsible="offcanvas"
      {...props}
    >
      {" "}
      <SidebarHeader className={isNative ? "native-padding" : ""}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Forge Health Portal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
