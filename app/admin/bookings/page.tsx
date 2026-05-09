"use client";

import { useState } from "react";
import { MagnifyingGlass, Check, X, Eye } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchSearch =
      !search ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      `${b.vehicle.make} ${b.vehicle.model}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{MOCK_BOOKINGS.length} total bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:max-w-xs w-full">
          <Input
            placeholder="Search by customer or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Reserved", "Confirmed", "Completed", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-sm text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <span className="text-xs font-mono font-medium text-gray-600">
                  {booking.id.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>
                <p className="font-medium text-gray-900">{booking.customerName}</p>
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
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon-xs" title="View">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                  {booking.status === "Reserved" && (
                    <>
                      <Button variant="ghost" size="icon-xs" title="Confirm">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Cancel">
                        <X className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm border border-gray-100">
          <p className="text-gray-400 text-sm">No bookings found</p>
        </div>
      )}
    </div>
  );
}
