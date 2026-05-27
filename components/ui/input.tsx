import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconRight, ...props }, ref) => {
    if (icon || iconRight) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "h-11 w-full min-w-0 rounded-sm border bg-white py-2 text-sm",
              "text-gray-900 placeholder:text-gray-400",
              "border-gray-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              "selection:bg-primary selection:text-white",
              "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
              "transition-colors",
              className
            )}
            style={{ 
              paddingLeft: icon ? "2.5rem" : "1rem", 
              paddingRight: iconRight ? "2.5rem" : "1rem",
              ...props.style 
            }}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-gray-400 flex items-center">
              {iconRight}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-11 w-full min-w-0 rounded-sm border bg-white px-4 py-2 text-sm",
          "text-gray-900 placeholder:text-gray-400",
          "border-gray-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
          "selection:bg-primary selection:text-white",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          "transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
