"use client";

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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  User,
  ShoppingBag,
  Heart,
  MessageCircle,
  Settings,
  ChevronDown,
  LogOut,
  ArrowLeft,
  CarIcon,
  ToolboxIcon,
  ReceiptTextIcon,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/shared/utils";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MenuGroup = {
  title?: string;
  items: MenuItem[];
};

const customerMenu: MenuGroup[] = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", url: "/customer-panel", icon: Home },
      { title: "Profile", url: "/customer-panel/profile", icon: User },
    ],
  },
  {
    title: "Vehicles & Services",
    items: [
      { title: "Vehicles", url: "/customer-panel/vehicles", icon: CarIcon },
      {
        title: "Vehicle Services",
        url: "/customer-panel/vehicle-services",
        icon: ToolboxIcon,
      },
      {
        title: "Factors",
        url: "/customer-panel/factors",
        icon: ReceiptTextIcon,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Messages",
        url: "/customer-panel/messages",
        icon: MessageCircle,
      },
    ],
  },
  {
    items: [
      { title: "Settings", url: "/customer-panel/settings", icon: Settings },
    ],
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <h2 className="text-base font-semibold">Customer Panel</h2>
        <SidebarTrigger />
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2">
        {customerMenu.map((group, index) => (
          <SidebarGroup key={group.title || index} className="my-1">
            {group.title ? (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={clsx(
                      "flex w-full items-center justify-between cursor-pointer rounded-md",
                      "px-3 py-2 text-sm font-medium",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent className="mt-1 ml-1 border-l border-sidebar-border pl-3 space-y-1">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "rounded-md",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              pathname.toLowerCase() === item.url &&
                                "bg-sidebar-accent text-sidebar-accent-foreground", // active
                            )}
                          >
                            <Link
                              href={item.url}
                              className="flex items-center gap-2"
                            >
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
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={clsx(
                          "rounded-md",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
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

      {/* Footer */}
      <CustomerSidebarFooter customerName="John Doe" />
    </Sidebar>
  );
}

type Props = {
  customerName: string;
};

export function CustomerSidebarFooter({ customerName }: Props) {
  return (
    <SidebarFooter className="border-t border-sidebar-border p-3">
      {/* User */}
      <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-sidebar-accent">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
          {customerName?.charAt(0)}
        </div>

        <div className="flex flex-col text-sm leading-none">
          <span className="font-medium">{customerName}</span>
          <span className="text-xs text-muted-foreground">Customer</span>
        </div>
      </div>

      {/* Menu */}
      <SidebarMenu className="mt-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Link href="/customer/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to App</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Link
              href="/logout"
              className="flex items-center gap-2 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
