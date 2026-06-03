import Link from "next/link";
import {
  TrendUp, CalendarBlank, Car, CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatCard, SummaryCard } from "@/components/cars";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { getDashboardStats, getAllBookingsSummary } from "@/lib/actions/bookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingSummary } from "@/lib/supabase/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminDashboard() {
  const [stats, allBookings] = await Promise.all([
    getDashboardStats(),
    getAllBookingsSummary(),
  ]);

  const recentBookings = allBookings.slice(0, 4);
  const revenueByMonth = stats.revenueByMonth;
  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue), 1);

  const fleetItems = [
    { label: "Available", count: stats.availableVehicles, color: "bg-success", pct: stats.totalVehicles > 0 ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 0 },
    { label: "Rented", count: stats.rentedVehicles, color: "bg-info", pct: stats.totalVehicles > 0 ? Math.round((stats.rentedVehicles / stats.totalVehicles) * 100) : 0 },
    { label: "Maintenance", count: stats.maintenanceVehicles, color: "bg-warning", pct: stats.totalVehicles > 0 ? Math.round((stats.maintenanceVehicles / stats.totalVehicles) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="money"
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="From completed bookings"
          trendUp
        />
        <StatCard
          icon="calendar"
          label="Total Bookings"
          count={stats.totalBookings}
          trend="All time"
          trendUp
        />
        <StatCard
          icon="car"
          label="Active Rentals"
          count={stats.activeRentals}
          trend="Live now"
          trendUp
        />
        <StatCard
          icon="users"
          label="Fleet Utilization"
          value={`${stats.fleetUtilization}%`}
          trend={`${stats.availableVehicles} available`}
          trendUp
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
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
              {revenueByMonth.map((d, i) => {
                const height = (d.revenue / maxRevenue) * 100;
                const isLast = i === revenueByMonth.length - 1;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end" style={{ height: "110px" }}>
                      <div
                        className={`w-full rounded-t-xl transition-all ${isLast ? "bg-gradient-to-t from-orange-500 to-orange-600 shadow-md shadow-orange-500/10 hover:opacity-90" : "bg-slate-100 hover:bg-slate-200"}`}
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
                  {formatCurrency(revenueByMonth.reduce((s, d) => s + d.revenue, 0))}
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
        <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
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
            {fleetItems.map(({ label, count, color, pct }) => (
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              <p className="text-xs text-gray-500">Total Vehicles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings summary */}
        <SummaryCard
          title="Recent Bookings"
          emptyIcon={CalendarBlank}
          emptyText="No bookings yet"
          hasData={recentBookings.length > 0}
        >
          <div className="space-y-1.5">
            {recentBookings.map((booking: BookingSummary) => (
              <div
                key={booking.id}
                className="flex items-center justify-between px-2 py-1.5 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs">
                      {getInitials(booking.customer_name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate leading-tight">
                      {booking.customer_name}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-tight">{booking.vehicle_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={booking.booking_status} className="text-[10px] px-1.5 py-0 hidden sm:inline-flex" />
                  <p className="text-xs font-semibold text-primary hidden md:block">
                    {formatCurrency(booking.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SummaryCard>

        {/* Fleet summary */}
        <SummaryCard
          title="Available Vehicles"
          emptyIcon={Car}
          emptyText="No vehicles available"
          hasData={stats.availableVehicles > 0}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-sm">
              <span className="text-xs text-gray-600">Available</span>
              <span className="text-xs font-semibold text-success">{stats.availableVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-sm">
              <span className="text-xs text-gray-600">Rented</span>
              <span className="text-xs font-semibold text-info">{stats.rentedVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-sm">
              <span className="text-xs text-gray-600">Maintenance</span>
              <span className="text-xs font-semibold text-warning">{stats.maintenanceVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-sm">
              <span className="text-xs text-gray-600">Total Fleet</span>
              <span className="text-xs font-semibold text-gray-900">{stats.totalVehicles}</span>
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Full bookings table */}
      <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
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
              {allBookings.map((booking: BookingSummary) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{booking.id.toUpperCase().slice(0, 8)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-700">{booking.vehicle_name}</p>
                    <p className="text-xs text-gray-400">{booking.license_plate}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-700">{formatDate(booking.start_date)}</p>
                    <p className="text-xs text-gray-400">→ {formatDate(booking.end_date)}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">{formatCurrency(booking.total_amount)}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.booking_status} />
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
