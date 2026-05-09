"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-dark shadow-sm",
        destructive:
          "bg-danger text-white hover:bg-red-600",
        outline:
          "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary-lighter",
        secondary:
          "bg-primary-light text-primary hover:bg-primary-lighter shadow-sm",
        ghost:
          "bg-transparent text-gray-700 hover:bg-primary-light hover:text-primary",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2.5 has-[>svg]:px-3",
        xs: "gap-1 rounded-md px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "rounded-md gap-1.5 px-3 py-1.5 has-[>svg]:px-2.5",
        lg: "rounded-md px-6 py-3 has-[>svg]:px-4",
        xl: "rounded-md px-10 py-4 has-[>svg]:px-8",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
