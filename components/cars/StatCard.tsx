"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Money, CalendarBlank, Car, Users } from "@phosphor-icons/react";

interface StatCardProps {
  icon: "money" | "calendar" | "car" | "users";
  label: string;
  value?: string;
  count?: number;
  trend?: string;
  trendUp?: boolean;
  onAdd?: () => void;
}

const iconMap = {
  money: Money,
  calendar: CalendarBlank,
  car: Car,
  users: Users,
};

export function StatCard({ icon, label, value, count, trend, trendUp, onAdd }: StatCardProps) {
  const Icon = iconMap[icon];
  
  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-all border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">
            {count !== undefined ? count : value ?? ""}
          </p>
          <p className="text-sm text-gray-500">{label}</p>
          {trend && (
            <p className={`text-xs font-medium mt-0.5 ${trendUp ? "text-success" : "text-danger"}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
      {onAdd && (
        <Button onClick={onAdd} variant="ghost" size="icon-sm">
          <Plus className="w-4 h-4 text-gray-400" />
        </Button>
      )}
    </Card>
  );
}
