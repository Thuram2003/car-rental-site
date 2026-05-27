import { TrendUp, Money, Car, CalendarBlank, Users } from "@phosphor-icons/react/dist/ssr";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/cars";
import { getDashboardStats } from "@/lib/actions/bookings";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_DATA = [
  { label: "SUV", count: 3, revenue: 11100000, pct: 38 },
  { label: "Economy", count: 2, revenue: 7200000, pct: 25 },
  { label: "Luxury", count: 2, revenue: 6300000, pct: 22 },
  { label: "Sports", count: 1, revenue: 2700000, pct: 9 },
  { label: "Van", count: 1, revenue: 1650000, pct: 6 },
];

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const revenueByMonth = stats.revenueByMonth;
  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue), 1);
  const { bookingStatusCounts } = stats;

  const cancellationRate =
    stats.totalBookings > 0
      ? Math.round((bookingStatusCounts.cancelled / stats.totalBookings) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live data overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Money}
          label="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="From completed bookings"
          trendUp
        />
        <StatCard
          icon={CalendarBlank}
          label="Total Bookings"
          count={stats.totalBookings}
          trend={`${bookingStatusCounts.completed} completed`}
          trendUp
        />
        <StatCard
          icon={Car}
          label="Fleet Utilization"
          value={`${stats.fleetUtilization}%`}
          trend={`${stats.activeRentals} active rentals`}
          trendUp
        />
        <StatCard
          icon={Users}
          label="Cancellation Rate"
          value={`${cancellationRate}%`}
          trend={`${bookingStatusCounts.cancelled} cancelled`}
          trendUp={false}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card className="border-gray-100">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Monthly Revenue</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-success font-medium">
                <TrendUp className="w-3.5 h-3.5" />
                Live
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end gap-3 h-44">
              {revenueByMonth.map((d, i) => {
                const height = (d.revenue / maxRevenue) * 100;
                const isLast = i === revenueByMonth.length - 1;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {isLast ? `${(d.revenue / 1000).toFixed(0)}k` : ""}
                    </span>
                    <div className="w-full flex flex-col justify-end" style={{ height: "130px" }}>
                      <div
                        className={`w-full rounded-t-sm ${isLast ? "bg-primary" : "bg-gray-100"}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by category */}
        <Card className="border-gray-100">
          <CardHeader className="p-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-900">Revenue by Category</h2>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            {CATEGORY_DATA.map(({ label, count, revenue, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-xs text-gray-400">{count} vehicles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Booking status breakdown */}
      <Card className="border-gray-100">
        <CardHeader className="p-5 pb-3">
          <h2 className="text-sm font-semibold text-gray-900">Booking Status Breakdown</h2>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Pending", count: bookingStatusCounts.pending, bg: "bg-warning-light", text: "text-warning" },
              { label: "Confirmed", count: bookingStatusCounts.confirmed, bg: "bg-info-light", text: "text-info" },
              { label: "Active", count: bookingStatusCounts.active, bg: "bg-primary-lighter", text: "text-primary" },
              { label: "Completed", count: bookingStatusCounts.completed, bg: "bg-success-light", text: "text-success" },
              { label: "Cancelled", count: bookingStatusCounts.cancelled, bg: "bg-danger-light", text: "text-danger" },
            ].map(({ label, count, bg, text }) => (
              <div key={label} className={`rounded-sm p-4 text-center ${bg}`}>
                <p className={`text-3xl font-bold ${text}`}>{count}</p>
                <p className={`text-sm font-medium mt-1 ${text}`}>{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
