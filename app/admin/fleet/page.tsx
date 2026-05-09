"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MOCK_VEHICLES, type Vehicle } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const addVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(4, "Year is required"),
  color: z.string().min(1, "Color is required"),
  dailyRate: z.string().min(1, "Daily rate is required"),
  seats: z.string().min(1, "Seats is required"),
  vin: z.string().min(5, "VIN is required"),
});

type AddVehicleValues = z.infer<typeof addVehicleSchema>;

export default function FleetPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = MOCK_VEHICLES.filter((v) => {
    const matchSearch =
      !search || `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_VEHICLES.length} vehicles total</p>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((vehicle) => (
            <VehicleRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm border border-gray-100">
          <p className="text-gray-400 text-sm">No vehicles found</p>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </div>
  );
}

function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-10 rounded-sm overflow-hidden shrink-0">
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</p>
            <p className="text-xs text-gray-400">{vehicle.year} · {vehicle.color}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{vehicle.category}</TableCell>
      <TableCell>
        <span className="font-semibold text-gray-900">{formatCurrency(vehicle.dailyRate)}</span>
        <span className="text-xs text-gray-400">/day</span>
      </TableCell>
      <TableCell>{vehicle.location}</TableCell>
      <TableCell>
        <StatusBadge status={vehicle.status} />
      </TableCell>
      <TableCell>
        <span className="text-sm font-semibold text-gray-800">⭐ {vehicle.rating}</span>
        <span className="text-xs text-gray-400 ml-1">({vehicle.reviewCount})</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-xs">
            <PencilSimple className="w-3.5 h-3.5 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <Trash className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AddVehicleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const form = useForm<AddVehicleValues>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: { make: "", model: "", year: "", color: "", dailyRate: "", seats: "", vin: "" },
  });

  const onSubmit = (values: AddVehicleValues) => {
    console.log(values);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl><Input placeholder="Toyota" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl><Input placeholder="Camry" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl><Input placeholder="2024" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl><Input placeholder="Pearl White" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="65" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seats</FormLabel>
                    <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN Number</FormLabel>
                  <FormControl><Input placeholder="1HGBH41JXMN109186" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={form.handleSubmit(onSubmit)}>Add Vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
