import { AdminSidebar } from "@/app/admin/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import clsx from "clsx";

export default function Layout({ children }: any) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <div className="flex flex-col grow shrink">
        <SidebarTrigger className={clsx("md:hidden")} />

        {children}
      </div>
    </SidebarProvider>
  );
}
