"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white border-transparent hover:bg-primary-dark",
        secondary:
          "bg-primary-light text-primary border-transparent hover:bg-primary-lighter",
        destructive:
          "bg-danger text-white border-transparent hover:bg-red-600",
        outline:
          "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary",
        ghost:
          "bg-transparent text-gray-600 border-transparent hover:bg-primary-light hover:text-primary",
        success:
          "bg-success-light text-success border-transparent",
        warning:
          "bg-warning-light text-warning border-transparent",
        danger:
          "bg-danger-light text-danger border-transparent",
        info:
          "bg-info-light text-info border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// ─── Status-aware badge (maps domain status → variant) ───────────────────────

const STATUS_VARIANT_MAP: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  Available: "success",
  Rented: "info",
  Maintenance: "warning",
  Reserved: "warning",
  Confirmed: "info",
  Completed: "success",
  Cancelled: "danger",
  Active: "success",
  Inactive: "ghost",
  Pending: "warning",
  Paid: "success",
  Failed: "danger",
  Refunded: "outline",
};

function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = STATUS_VARIANT_MAP[status] ?? "outline";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
