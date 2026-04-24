import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "../admin/sidebar-edge-tab";
import CustomerSidebar from "./customer-panel-sidebar";
import Auth from "@/components/shared/utils/auth";
import { cn } from "@/lib/shared/utils";
import { Background_Gradient } from "@/lib/shared/styles-classes";

export default function LayoutVehicles({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Auth>
      <SidebarProvider>
        <CustomerSidebar />
        <SidebarEdgeTab />
        <div
          className={cn(
            "flex flex-col grow shrink bg-background",
            Background_Gradient,
          )}
        >
          {children}
        </div>
      </SidebarProvider>
    </Auth>
  );
}
