import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  Settings,
  User,
  Mail,
  Users,
  Shield,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MenuGroup = {
  title?: string;
  items: MenuItem[];
};

const menuData: MenuGroup[] = [
  {
    title: "Service",
    items: [
      { title: "Service", url: "/admin/service", icon: Home },
      { title: "Repairman", url: "/admin/repairman", icon: User },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Messages", url: "/messages", icon: Mail },
      { title: "Team", url: "/team", icon: Users },
    ],
  },
  {
    // This group has NO title, so it cannot be collapsible.
    // It will render as a simple list of links.
    items: [
      { title: "Admin", url: "/admin", icon: Shield },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar className="">
      <SidebarHeader className="flex flex-row items-center justify-between w-full ">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <SidebarTrigger className="" />
      </SidebarHeader>

      <SidebarContent>
        {menuData.map((group, index) => (
          <SidebarGroup className={clsx("py-0")} key={group.title || index}>
            {/* Render Collapsible if title exists */}
            {group.title ? (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer ">
                    <span>{group.title}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent className=" overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link href={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Render simple list if no title (single links)
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <p className="text-sm text-muted-foreground">© 2026 My App</p>
      </SidebarFooter>
    </Sidebar>
  );
}
