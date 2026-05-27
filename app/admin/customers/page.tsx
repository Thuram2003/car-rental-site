"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlass, Eye, Phone } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { getCustomers } from "@/lib/actions/auth";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? "Loading..." : `${customers.length} registered customers`}
        </p>
      </div>

      <div className="relative max-w-xs">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-sm border border-gray-100">
          <p className="text-gray-400 text-sm">Loading customers...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary-light text-primary text-xs font-bold">
                        {customer.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-gray-900">{customer.full_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {customer.phone ?? "—"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-gray-600">
                    {customer.license_number ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">—</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">—</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-500">{formatDate(customer.created_at)}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status="Active" />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-xs">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
