"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MagnifyingGlass,
  Phone,
  MapPin,
  Calendar,
  TrendUp,
  UserPlus,
  Eye,
  Spinner,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getAllCustomers, getCustomerStats, type CustomerWithStats } from "@/lib/actions/customers";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    newThisWeek: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (search) {
      const query = search.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.full_name.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.city?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [search, customers]);

  async function loadData() {
    setLoading(true);
    const [customersData, statsData] = await Promise.all([
      getAllCustomers(),
      getCustomerStats(),
    ]);
    setCustomers(customersData);
    setFilteredCustomers(customersData);
    setStats(statsData);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 font-light mt-0.5">Manage customer accounts and view their activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 border border-orange-100/50 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{stats.totalCustomers}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Total Customers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{stats.newThisMonth}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">New This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-100/50 shadow-inner">
              <TrendUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{stats.newThisWeek}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">New This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="relative w-full md:max-w-xs shrink-0">
          <Input
            placeholder="Search by name, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MagnifyingGlass className="w-4.5 h-4.5 text-gray-400" />}
            className="h-10 pl-9 border-gray-200 font-semibold"
          />
        </div>
      </div>

      {/* Customers List */}
      <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-500 text-sm font-semibold">
                {search ? "No customers found" : "No customers yet"}
              </p>
              <p className="text-xs text-gray-400 font-light mt-1">
                {search
                  ? "Try adjusting your search filters."
                  : "Registered customer records will list here automatically."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-4">Contact Phone</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Bookings</th>
                    <th className="py-4 px-4">Total Spent</th>
                    <th className="py-4 px-4">Joined</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                            {customer.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-950 leading-tight">{customer.full_name}</p>
                            {customer.license_number && (
                              <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5 uppercase">License: {customer.license_number}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        {customer.phone ? (
                          <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-xs font-semibold">{customer.phone}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No Phone</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-4">
                        {customer.city ? (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-xs font-semibold">{customer.city}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unknown</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-800">
                            {customer.total_bookings} total
                          </p>
                          {customer.active_bookings > 0 && (
                            <Badge variant="success" className="scale-90 origin-left uppercase text-[9px] font-bold px-1.5 py-0">
                              {customer.active_bookings} active
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 text-xs">
                          {formatCurrency(customer.total_spent)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-semibold">{new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-xl h-8 text-xs font-semibold px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
