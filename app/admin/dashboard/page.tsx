"use client";

import Link from "next/link";
import {
  TrendUp, Money, CalendarBlank, Car, Users,
  ArrowUpRight, CaretRight,
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatCard, MetricBox, SummaryCard, BookingItem, CarItem } from "@/components/cars";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  ADMIN_STATS, MOCK_BOOKINGS, MOCK_VEHICLES, REVENUE_DATA,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const MAX_REVENUE = Math.max(...REVENUE_DATA.map((d) => d.revenue));

export default function AdminDashboard() {
  const recentBookings = MOCK_BOOKINGS.slice(0, 4);
  const availableVehicles = MOCK_VEHICLES.filter((v) => v.status === "Available").slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Money}
          label="Total Revenue"
          value={formatCurrency(ADMIN_STATS.totalRevenue)}
          trend={`+${ADMIN_STATS.revenueGrowth}% this month`}
          trendUp
        />
        <StatCard
          icon={CalendarBlank}
          label="Total Bookings"
          count={ADMIN_STATS.totalBookings}
          trend={`+${ADMIN_STATS.bookingsGrowth}% this month`}
          trendUp
        />
        <StatCard
          icon={Car}
          label="Active Rentals"
          count={ADMIN_STATS.activeRentals}
          trend="Live now"
          trendUp
        />
        <StatCard
          icon={Users}
          label="Fleet Utilization"
          value={`${ADMIN_STATS.fleetUtilization}%`}
          trend={`${ADMIN_STATS.availableVehicles} available`}
          trendUp
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 border-gray-100">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Revenue Overview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-success font-medium bg-success-light px-2.5 py-1 rounded-full">
                <TrendUp className="w-3.5 h-3.5" />
                +12.5%
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {/* CSS bar chart */}
            <div className="flex items-end gap-3 h-36">
              {REVENUE_DATA.map((d) => {
                const height = (d.revenue / MAX_REVENUE) * 100;
                const isLast = d === REVENUE_DATA[REVENUE_DATA.length - 1];
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end" style={{ height: "110px" }}>
                      <div
                        className={`w-full rounded-t-sm transition-all ${isLast ? "bg-primary" : "bg-gray-100"}`}
                        style={{ height: `${height}%` }}
                        title={formatCurrency(d.revenue)}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400">{d.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Total:{" "}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(REVENUE_DATA.reduce((s, d) => s + d.revenue, 0))}
                </span>
              </span>
              <Link href="/admin/reports">
                <Button variant="ghost" size="xs">
                  Full Report <CaretRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Fleet status */}
        <Card className="border-gray-100">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Fleet Status</h2>
              <Link href="/admin/fleet">
                <Button variant="ghost" size="xs">
                  Manage <CaretRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            {[
              { label: "Available", count: 16, color: "bg-success", pct: 67 },
              { label: "Rented", count: 6, color: "bg-info", pct: 25 },
              { label: "Maintenance", count: 2, color: "bg-warning", pct: 8 },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}

            <div className="text-center py-3 bg-gray-50 rounded-sm mt-2">
              <p className="text-2xl font-bold text-gray-900">{ADMIN_STATS.totalVehicles}</p>
              <p className="text-xs text-gray-500">Total Vehicles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <SummaryCard
          title="Recent Bookings"
          emptyIcon={CalendarBlank}
          emptyText="No bookings yet"
          hasData={recentBookings.length > 0}
          onSeeAll={() => {}}
        >
          <div className="space-y-1.5">
            {recentBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        </SummaryCard>

        {/* Available vehicles */}
        <SummaryCard
          title="Available Vehicles"
          emptyIcon={Car}
          emptyText="No vehicles available"
          hasData={availableVehicles.length > 0}
          onSeeAll={() => {}}
        >
          <div className="space-y-1.5">
            {availableVehicles.map((vehicle) => (
              <CarItem key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </SummaryCard>
      </div>

      {/* Full bookings table */}
      <Card className="border-gray-100">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">All Recent Bookings</h2>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="xs">
                View All <CaretRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BOOKINGS.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-xs text-gray-400 font-mono">{booking.id.toUpperCase()}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-700">{booking.vehicle.make} {booking.vehicle.model}</p>
                    <p className="text-xs text-gray-400">{booking.vehicle.year}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-700">{formatDate(booking.startDate)}</p>
                    <p className="text-xs text-gray-400">→ {formatDate(booking.endDate)}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">{formatCurrency(booking.totalCost)}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
