"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ReactNode } from "react";

export default function FormDrawer({
  open,
  setOpen,
  title,
  description,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
