"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DatePicker } from "./ui/date-picker";
import { useDate } from "@/providers/date-provider";

export function SiteHeader() {
  const [header, setHeader] = useState("");
  const { date, setDate } = useDate();

  const pathname = usePathname();

  useEffect(() => {
    function formatHeader(pathname: string) {
      const string = pathname.substring(1);

      if (!string) return "";

      const formattedString = string[0].toUpperCase() + string.substring(1);
      return formattedString;
    }
    setHeader(formatHeader(pathname));
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full justify-between items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-row items-center">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{header}</h1>
        </div>
        {pathname !== "/dashboard" && pathname !== "/progress" && (
          <DatePicker date={date} setDate={setDate} />
        )}
      </div>
    </header>
  );
}
