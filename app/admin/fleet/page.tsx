"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, MagnifyingGlass, PencilSimple, Trash, Spinner, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
  const [vehicleToEdit, setVehicleToEdit] = useState<DbVehicle | null>(null);

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
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Fleet Management</h1>
          <p className="text-sm text-gray-500 font-light mt-0.5">{vehicles.length} total vehicles registered</p>
        </div>
        <Button variant="default" size="sm" onClick={() => { setVehicleToEdit(null); setShowAddDialog(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/10">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters Search & Category pills */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs shrink-0">
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlass className="w-4.5 h-4.5 text-gray-400" />}
              className="h-10 pl-9 border-gray-200 font-semibold"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap items-center w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1 md:pb-0">
            {["All", "Available", "Rented", "Maintenance"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                    : "bg-gray-50 border border-gray-100 text-gray-500 hover:border-orange-200 hover:text-orange-505"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card container */}
      <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <tr className="bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                    <th className="py-4 px-5">Vehicle</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Daily Rate</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filtered.map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      onDeactivate={() => handleDeactivate(vehicle.id)}
                      onEdit={() => {
                        setVehicleToEdit(vehicle);
                        setShowAddDialog(true);
                      }}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 px-6">
              <WarningCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-semibold">No vehicles found</p>
              <p className="text-xs text-gray-400 font-light mt-1">Try resetting the filter search query.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Vehicle Drawer */}
      <AddVehicleDrawer
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setVehicleToEdit(null);
        }}
        onSuccess={() => {
          setShowAddDialog(false);
          setVehicleToEdit(null);
          load();
        }}
        vehicleToEdit={vehicleToEdit}
      />
    </div>
  );
}

// ─── Vehicle Row ──────────────────────────────────────────────────────────────

function VehicleRow({
  vehicle,
  onDeactivate,
  onEdit,
}: {
  vehicle: DbVehicle;
  onDeactivate: () => void;
  onEdit: () => void;
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
          <Button variant="ghost" size="icon-xs" onClick={onEdit}>
            <PencilSimple className="w-3.5 h-3.5 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              if (window.confirm(`Are you sure you want to deactivate/delete ${vehicle.make} ${vehicle.model}?`)) {
                onDeactivate();
              }
            }}
          >
            <Trash className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
