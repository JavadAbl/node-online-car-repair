import { cn } from "@/lib/shared/utils";
import * as React from "react";

type ContentCardProps = {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
};

export function ContentCard({
  title,
  description,
  footer,
  children,
  className,
  containerClassName,
}: ContentCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background px-6 py-4 border-b ",
        containerClassName,
      )}
    >
      {(title || description) && (
        <header className="border-b px-6 py-4">
          {title && (
            <h3 className="text-lg font-semibold leading-none">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </header>
      )}

      {/* FULL-WIDTH CONTENT */}
      <div className={cn("w-full", className)}>{children}</div>

      {footer && (
        <footer className="border-t px-6 py-4 flex justify-end gap-2">
          {footer}
        </footer>
      )}
    </section>
  );
}
