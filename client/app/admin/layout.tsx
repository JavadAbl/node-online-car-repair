import { AdminSidebar } from "@/app/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "./sidebar-edge-tab";

export default function LayoutAdmin({ children }: any) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarEdgeTab />
      <div className="flex flex-col grow shrink">{children}</div>
    </SidebarProvider>
  );
}
