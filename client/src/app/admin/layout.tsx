import { AdminSidebar } from "@/app/admin/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarEdgeTab from "./components/sidebar-edge-tab";
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
