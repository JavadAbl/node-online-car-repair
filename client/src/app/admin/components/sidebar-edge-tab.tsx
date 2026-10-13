"use client";

import { useSidebar } from "@/components/ui/sidebar";

export default function SidebarEdgeTab() {
  const { toggleSidebar, open, isMobile } = useSidebar();

  if (!isMobile && open) return null;

  return (
    <button
      onClick={toggleSidebar}
      className="
        flex absolute left-0 top-1/2 -translate-y-1/2
        h-24 w-3 bg-primary rounded-r-md shadow
        items-center justify-center cursor-pointer
      "
    />
  );
}
