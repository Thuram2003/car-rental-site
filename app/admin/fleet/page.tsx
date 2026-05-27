"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, MagnifyingGlass, PencilSimple, Trash, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getAllVehiclesAdmin, deactivateVehicle } from "@/lib/actions/vehicles";
import { formatCurrency } from "@/lib/utils";
import { AddVehicleDrawer } from "@/components/cars";

// ─── Types ────────────────────────────────────────────────────────────────────

type DbVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  color: string;
  license_plate: string;
  daily_rate: number;
  status: string;
  image_url: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean;
  branches?: { name: string } | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllVehiclesAdmin();
    setVehicles(data as DbVehicle[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      !search || `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDeactivate = async (id: string) => {
    const ok = await deactivateVehicle(id);
    if (ok) {
      toast.success("Vehicle removed from fleet");
      load();
    } else {
      toast.error("Failed to remove vehicle");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicles total</p>
        </div>
        <Button variant="default" size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:max-w-xs w-full">
          <Input
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Available", "Rented", "Maintenance"].map((s) => (
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((vehicle) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                onDeactivate={() => handleDeactivate(vehicle.id)}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm border border-gray-100">
          <p className="text-gray-400 text-sm">No vehicles found</p>
        </div>
      )}

      {/* Add Vehicle Drawer */}
      <AddVehicleDrawer
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => { setShowAddDialog(false); load(); }}
      />
    </div>
  );
}

// ─── Vehicle Row ──────────────────────────────────────────────────────────────

function VehicleRow({
  vehicle,
  onDeactivate,
}: {
  vehicle: DbVehicle;
  onDeactivate: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-10 rounded-sm overflow-hidden shrink-0 bg-gray-100">
            {vehicle.image_url ? (
              <Image
                src={vehicle.image_url}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                No img
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</p>
            <p className="text-xs text-gray-400">{vehicle.year} · {vehicle.color}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{vehicle.category}</TableCell>
      <TableCell>
        <span className="font-semibold text-gray-900">{formatCurrency(vehicle.daily_rate)}</span>
        <span className="text-xs text-gray-400">/day</span>
      </TableCell>
      <TableCell>{vehicle.branches?.name ?? "—"}</TableCell>
      <TableCell>
        <StatusBadge status={vehicle.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-xs">
            <PencilSimple className="w-3.5 h-3.5 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDeactivate}>
            <Trash className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
