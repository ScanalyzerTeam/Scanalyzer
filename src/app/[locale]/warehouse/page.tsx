"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  ChevronRight,
  MapPin,
  Package,
  Plus,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Warehouse } from "@/lib/warehouse/types";

interface WarehouseWithStats extends Warehouse {
  shelfCount: number;
  itemCount: number;
}

const WarehousePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // UI state
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showCreateZone, setShowCreateZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📷", label: "Scanner", href: "/scanner" },
    { icon: "🏢", label: "Warehouse", href: "/warehouse" },
    { icon: "💬", label: "AI Assistant", href: "/ai-assistant" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  // Fetch all warehouses with stats
  const { data: warehouses = [], isLoading } = useQuery<WarehouseWithStats[]>({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouse");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Create warehouse mutation
  const createWarehouse = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create warehouse");
      return res.json();
    },
    onSuccess: (newWarehouse) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setShowCreateZone(false);
      setNewZoneName("");
      // Navigate to the new warehouse map
      router.push(`/warehouse/${newWarehouse.id}`);
    },
  });

  // Delete warehouse mutation
  const deleteWarehouse = useMutation({
    mutationFn: async (warehouseId: string) => {
      const res = await fetch(`/api/warehouse?id=${warehouseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete warehouse");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setSelectedZoneId(null);
    },
  });

  const handleDeleteZone = () => {
    if (
      selectedZoneId &&
      confirm(
        "Are you sure you want to delete this zone? All shelves and items will be permanently deleted.",
      )
    ) {
      deleteWarehouse.mutate(selectedZoneId);
    }
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newZoneName.trim()) {
      createWarehouse.mutate(newZoneName.trim());
    }
  };

  // Get zone letter for a warehouse based on its index
  const getZoneLetter = (index: number) => String.fromCharCode(65 + index);

  // Get the selected warehouse details
  const selectedWarehouse = warehouses.find((w) => w.id === selectedZoneId);

  // Calculate total stats
  const totalShelves = warehouses.reduce(
    (sum, w) => sum + (w.shelfCount || 0),
    0,
  );
  const totalItems = warehouses.reduce((sum, w) => sum + (w.itemCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white p-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC107]">
            <svg
              className="h-7 w-7 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <span className="font-semibold text-black">AI Warehouse</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname?.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#FFF9E6] text-black"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-[#f5f5f5]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Warehouse Zones</h1>
              <p className="text-gray-600">
                Manage your warehouse zones and inventory
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Zones</p>
                <p className="text-xl font-bold text-black">
                  {warehouses.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Shelves</p>
                <p className="text-xl font-bold text-black">{totalShelves}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-bold text-black">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Zone Grid */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse text-gray-500">
                  Loading zones...
                </div>
              </div>
            ) : warehouses.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <WarehouseIcon className="mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  No zones yet
                </h3>
                <p className="mb-6 text-gray-500">
                  Create your first warehouse zone to get started
                </p>
                <Button onClick={() => setShowCreateZone(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Zone
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Warehouse Zone Cards */}
                {warehouses.map((warehouse, index) => (
                  <div
                    key={warehouse.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedZoneId(warehouse.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedZoneId(warehouse.id);
                      }
                    }}
                    className={`cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md ${
                      selectedZoneId === warehouse.id
                        ? "ring-2 ring-[#FFC107]"
                        : ""
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF9E6]">
                        <span className="text-xl font-bold text-[#FFC107]">
                          {getZoneLetter(index)}
                        </span>
                      </div>
                      <Link
                        href={`/warehouse/${warehouse.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>

                    <h3 className="mb-1 text-lg font-semibold text-black">
                      {warehouse.name}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Zone {getZoneLetter(index)}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Box className="h-4 w-4" />
                        <span>{warehouse.shelfCount || 0} shelves</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{warehouse.itemCount || 0} items</span>
                      </div>
                    </div>

                    {/* Capacity indicator */}
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-medium text-gray-700">
                          {Math.min(
                            100,
                            Math.round(
                              ((warehouse.shelfCount || 0) / 10) * 100,
                            ),
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#FFC107] transition-all"
                          style={{
                            width: `${Math.min(100, Math.round(((warehouse.shelfCount || 0) / 10) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Zone Card */}
                {warehouses.length < 6 && (
                  <button
                    onClick={() => setShowCreateZone(true)}
                    className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-gray-400 transition hover:border-[#FFC107] hover:text-[#FFC107]"
                  >
                    <Plus className="mb-2 h-8 w-8" />
                    <span className="font-medium">Add Zone</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Selected Zone Details Panel */}
          {selectedWarehouse && (
            <div className="flex w-80 flex-col border-l border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">
                  Zone Details
                </h3>
                <button
                  onClick={() => setSelectedZoneId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFF9E6]">
                  <span className="text-2xl font-bold text-[#FFC107]">
                    {getZoneLetter(
                      warehouses.findIndex(
                        (w) => w.id === selectedWarehouse.id,
                      ),
                    )}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-black">
                  {selectedWarehouse.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Zone{" "}
                  {getZoneLetter(
                    warehouses.findIndex((w) => w.id === selectedWarehouse.id),
                  )}
                </p>
              </div>

              {/* Zone Stats */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Shelves</span>
                  </div>
                  <span className="font-semibold text-black">
                    {selectedWarehouse.shelfCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Items</span>
                  </div>
                  <span className="font-semibold text-black">
                    {selectedWarehouse.itemCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Dimensions</span>
                  </div>
                  <span className="font-semibold text-black">
                    {selectedWarehouse.width}x{selectedWarehouse.height}
                  </span>
                </div>
              </div>

              {/* Open Map Button */}
              <Link href={`/warehouse/${selectedWarehouse.id}`}>
                <Button className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Open Map View
                </Button>
              </Link>

              {/* Spacer to push delete button to bottom */}
              <div className="flex-1" />

              {/* Delete Button at bottom */}
              <Button
                variant="outline"
                className="mt-6 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDeleteZone}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Zone
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Zone Dialog */}
      <Dialog open={showCreateZone} onOpenChange={setShowCreateZone}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Zone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateZone}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g., Main Storage"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateZone(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newZoneName.trim()}>
                Create Zone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehousePage;
