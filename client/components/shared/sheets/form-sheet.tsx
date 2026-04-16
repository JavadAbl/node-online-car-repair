"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/shared/utils";
import { ReactNode } from "react";

export default function FormSheet({
  open,
  setOpen,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className={cn("w-full sm:w-[350px] p-6", className)}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="mt-4 max-h-[85vh] overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
