import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "../admin/sidebar-edge-tab";
import CustomerSidebar from "./customer-panel-sidebar";

export default function LayoutVehicles({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarEdgeTab />
      <div className="flex flex-col grow shrink">{children}</div>
    </SidebarProvider>
  );
}
