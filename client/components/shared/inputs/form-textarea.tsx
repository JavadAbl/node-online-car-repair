import * as React from "react";

import { cn } from "@/lib/shared/utils";

// 1. Update the interface to allow 'null' for value and custom onChange
export interface TextareaProps extends Omit<
  React.ComponentProps<"textarea">,
  "value" | "onChange"
> {
  value?: string | null;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  nullable?: boolean;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ nullable = true, className, value, onChange, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        // 2. Convert null to empty string for display
        value={value ?? ""}
        onChange={(e) => {
          const inputValue = e.target.value;

          if (nullable) {
            if (inputValue === "") {
              // 3. If empty, send null to the form state
              onChange?.({
                ...e,
                target: {
                  ...e.target,
                  value: null as any,
                },
              });
            } else {
              // 4. Otherwise send the string
              onChange?.({
                ...e,
                target: {
                  ...e.target,
                  value: inputValue,
                },
              });
            }
          } else {
            // Standard behavior
            onChange?.(e);
          }
        }}
        {...props}
      />
    );
  },
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
