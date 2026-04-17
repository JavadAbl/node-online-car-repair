import { Card } from "@/components/ui/card";
import { cn } from "@/lib/shared/utils";
import * as React from "react";

export function ContentCard({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <Card className={cn("shadow-md bg-card/50 border", className)}>
      {children}
    </Card>
  );
}
