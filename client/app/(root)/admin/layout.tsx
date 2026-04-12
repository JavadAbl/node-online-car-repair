// ✅ CORRECT
import { AdminSidebar } from "@/components/pages/admin/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: any) {
  return (
    <div>
      <SidebarProvider>
        <AdminSidebar />

        <div className="flex-1">{children}</div>
      </SidebarProvider>
    </div>
  );
}
