"use client";

import Image from "next/image";
import Link from "next/link";
import { DotsThree } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicle } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface CarItemProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function CarItem({ vehicle, onEdit, onDelete, onView }: CarItemProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        {vehicle.imageUrl ? (
          <div className="relative w-10 h-8 rounded-sm overflow-hidden shrink-0">
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <Avatar className="w-10 h-8 rounded-sm">
            <AvatarFallback className="rounded-sm text-xs">
              {vehicle.make.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate leading-tight">
            {vehicle.make} {vehicle.model}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-gray-400">{vehicle.year}</p>
            <StatusBadge status={vehicle.status} className="text-[10px] px-1.5 py-0" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-xs font-semibold text-primary hidden sm:block">
          {formatCurrency(vehicle.dailyRate)}<span className="text-gray-400 font-normal">/day</span>
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
            {onEdit && (
              <DropdownMenuItem onClick={onEdit} className="text-xs cursor-pointer">
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} variant="destructive" className="text-xs cursor-pointer">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
