import { TrendUp, ChartBar, Funnel, ShieldCheck, Tag } from "@phosphor-icons/react/dist/ssr";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/cars";
import { getDashboardStats } from "@/lib/actions/bookings";
import { getAllVehicles } from "@/lib/actions/vehicles";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const vehicles = await getAllVehicles();
  
  const revenueByMonth = stats.revenueByMonth;
  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue), 1);
  const { bookingStatusCounts } = stats;

  const cancellationRate =
    stats.totalBookings > 0
      ? Math.round((bookingStatusCounts.cancelled / stats.totalBookings) * 100)
      : 0;

  // Calculate revenue by category from actual vehicle data
  const categoryStats = vehicles.reduce((acc: Record<string, { count: number; revenue: number }>, vehicle: any) => {
    const category = vehicle.category;
    if (!acc[category]) {
      acc[category] = { count: 0, revenue: 0 };
    }
    acc[category].count += 1;
    // Estimate revenue based on daily rate (this is approximate)
    acc[category].revenue += vehicle.daily_rate * 30; // Assume 30 days average
    return acc;
  }, {});

  const totalCategoryRevenue = Object.values(categoryStats).reduce((sum: number, cat: any) => sum + cat.revenue, 0);
  
  const categoryData = Object.entries(categoryStats).map(([label, data]: [string, any]) => ({
    label,
    count: data.count,
    revenue: data.revenue,
    pct: totalCategoryRevenue > 0 ? Math.round((data.revenue / totalCategoryRevenue) * 100) : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance and fleet utilization insights</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="money"
          label="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="From completed bookings"
          trendUp
        />
        <StatCard
          icon="calendar"
          label="Total Bookings"
          count={stats.totalBookings}
          trend={`${bookingStatusCounts.completed} completed`}
          trendUp
        />
        <StatCard
          icon="car"
          label="Fleet Utilization"
          value={`${stats.fleetUtilization}%`}
          trend={`${stats.activeRentals} active rentals`}
          trendUp
        />
        <StatCard
          icon="users"
          label="Cancellation Rate"
          value={`${cancellationRate}%`}
          trend={`${bookingStatusCounts.cancelled} cancelled`}
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ChartBar className="w-4 h-4 text-orange-500" />
                  Revenue Trends
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months monthly breakdown</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                <TrendUp className="w-3.5 h-3.5" />
                Live Feed
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {revenueByMonth.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No revenue data available yet
              </div>
            ) : (
              <div className="flex items-end gap-3 h-48 mt-4">
                {revenueByMonth.map((d, i) => {
                  const height = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                  const isLast = i === revenueByMonth.length - 1;
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}k` : "0"}
                      </span>
                      <div className="w-full flex flex-col justify-end" style={{ height: "130px" }}>
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isLast
                              ? "bg-gradient-to-t from-orange-500 to-orange-600 shadow-md shadow-orange-500/20 hover:opacity-90"
                              : "bg-slate-100 hover:bg-slate-200"
                          }`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={formatCurrency(d.revenue)}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by category */}
        <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                Fleet Distribution & Estimate
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Approximate monthly revenue per category (30-day index)</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-5">
            {categoryData.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No vehicles in fleet yet
              </div>
            ) : (
              categoryData.map(({ label, count, revenue, pct }) => (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                        {count} vehicle{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(revenue)}</span>
                      <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking status breakdown */}
      <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-6 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Funnel className="w-4 h-4 text-orange-500" />
              Booking Funnel Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Booking status ledger statistics</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Pending", count: bookingStatusCounts.pending, bg: "bg-amber-50/70 border-amber-100/50 hover:bg-amber-50", text: "text-amber-600" },
              { label: "Confirmed", count: bookingStatusCounts.confirmed, bg: "bg-blue-50/70 border-blue-100/50 hover:bg-blue-50", text: "text-blue-600" },
              { label: "Active", count: bookingStatusCounts.active, bg: "bg-orange-50/70 border-orange-100/50 hover:bg-orange-50", text: "text-orange-600" },
              { label: "Completed", count: bookingStatusCounts.completed, bg: "bg-emerald-50/70 border-emerald-100/50 hover:bg-emerald-50", text: "text-emerald-600" },
              { label: "Cancelled", count: bookingStatusCounts.cancelled, bg: "bg-rose-50/70 border-rose-100/50 hover:bg-rose-50", text: "text-rose-600" },
            ].map(({ label, count, bg, text }) => (
              <div
                key={label}
                className={`rounded-2xl p-5 border text-center transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center items-center shadow-sm ${bg}`}
              >
                <p className={`text-3xl font-extrabold tracking-tight ${text}`}>{count}</p>
                <p className={`text-xs font-semibold uppercase tracking-wider mt-2 opacity-80 ${text}`}>{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Overview */}
      <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-6 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              Fleet Roster Health
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of all catalogued vehicles</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Vehicles", count: stats.totalVehicles, bg: "bg-slate-50 border-slate-200/60 hover:bg-slate-100/70", text: "text-slate-700" },
              { label: "Available", count: stats.availableVehicles, bg: "bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100/70", text: "text-emerald-700" },
              { label: "Rented", count: stats.rentedVehicles, bg: "bg-orange-50 border-orange-200/60 hover:bg-orange-100/70", text: "text-orange-700" },
              { label: "Maintenance", count: stats.maintenanceVehicles, bg: "bg-amber-50 border-amber-200/60 hover:bg-amber-100/70", text: "text-amber-700" },
            ].map(({ label, count, bg, text }) => (
              <div
                key={label}
                className={`rounded-2xl p-5 border text-center transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center items-center shadow-sm ${bg}`}
              >
                <p className={`text-3xl font-extrabold tracking-tight ${text}`}>{count}</p>
                <p className={`text-xs font-semibold uppercase tracking-wider mt-2 opacity-80 ${text}`}>{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
