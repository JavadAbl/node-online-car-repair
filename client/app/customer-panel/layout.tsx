import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "../admin/sidebar-edge-tab";
import CustomerSidebar from "./customer-panel-sidebar";
import Auth from "@/components/shared/utils/auth";

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
        <div className="flex flex-col grow shrink">{children}</div>
      </SidebarProvider>
    </Auth>
  );
}
