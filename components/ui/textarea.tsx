import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-sm border bg-white px-4 py-3 text-sm",
          "text-gray-900 placeholder:text-gray-400",
          "border-gray-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
          "min-h-[100px]",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          "resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
