// components/ui/form-message-fixed.tsx

import { FormMessage } from "@/components/ui/form";
import clsx from "clsx";

interface Props {
  className?: string;
}

export function FormMessageFixed({ className }: Props) {
  return (
    <div className={clsx("min-h-[25px]", className)}>
      <FormMessage />
    </div>
  );
}
