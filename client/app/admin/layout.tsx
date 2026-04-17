import { AdminSidebar } from "@/app/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "./sidebar-edge-tab";
import Auth from "@/components/shared/utils/auth";

export default function LayoutAdmin({ children }: any) {
  return (
    <Auth>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarEdgeTab />
        <div className="flex flex-col grow shrink">{children}</div>
      </SidebarProvider>
    </Auth>
  );
}
