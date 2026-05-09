"use client";

import { DotsThree, CalendarBlank, MapPin } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Booking } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingItemProps {
  booking: Booking;
  onView?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BookingItem({ booking, onView, onConfirm, onCancel }: BookingItemProps) {
  const initials = getInitials(booking.customerName);

  return (
    <div className="flex items-center justify-between px-2 py-1.5 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="bg-primary-light text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate leading-tight">
            {booking.customerName}
          </p>
          <p className="text-[11px] text-gray-400 leading-tight">
            {booking.vehicle.make} {booking.vehicle.model}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={booking.status} className="text-[10px] px-1.5 py-0 hidden sm:inline-flex" />
        <p className="text-xs font-semibold text-primary hidden md:block">
          {formatCurrency(booking.totalCost)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <DotsThree className="w-3.5 h-3.5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={onView} className="text-xs cursor-pointer">
                View Details
              </DropdownMenuItem>
            )}
            {onConfirm && booking.status === "Reserved" && (
              <DropdownMenuItem onClick={onConfirm} className="text-xs cursor-pointer">
                Confirm Booking
              </DropdownMenuItem>
            )}
            {onCancel && (booking.status === "Reserved" || booking.status === "Confirmed") && (
              <DropdownMenuItem onClick={onCancel} variant="destructive" className="text-xs cursor-pointer">
                Cancel Booking
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
