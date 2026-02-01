"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Warehouse as WarehouseIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { ShelfInventoryPanel } from "@/components/inventory/ShelfInventoryPanel";
import { Button } from "@/components/ui/button";
import { WarehouseCanvas } from "@/components/warehouse/WarehouseCanvas";
import { WarehouseToolbar } from "@/components/warehouse/WarehouseToolbar";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Shelf, WarehouseWithShelves } from "@/lib/warehouse/types";

const WarehouseMapPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const warehouseId = params.id as string;

  // UI state
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  // Fetch warehouse with shelves
  const { data: warehouse, isLoading } = useQuery<WarehouseWithShelves>({
    queryKey: ["warehouse", warehouseId],
    queryFn: async () => {
      const res = await fetch(`/api/warehouse/${warehouseId}`);
      if (!res.ok) throw new Error("Failed to fetch warehouse");
      return res.json();
    },
    enabled: !!warehouseId,
    refetchInterval: 3000,
  });

  // Create shelf mutation
  const createShelf = useMutation({
    mutationFn: async (warehouseId: string) => {
      const existingShelves = warehouse?.shelves || [];
      const shelfNumber = existingShelves.length + 1;
      const res = await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId,
          name: `Shelf ${String.fromCharCode(64 + shelfNumber)}`,
          positionX: 100 + (shelfNumber - 1) * 20,
          positionY: 100 + (shelfNumber - 1) * 20,
        }),
      });
      if (!res.ok) throw new Error("Failed to create shelf");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    },
  });

  // Update shelf mutation
  const updateShelf = useMutation({
    mutationFn: async ({
      shelfId,
      updates,
    }: {
      shelfId: string;
      updates: Partial<Shelf>;
    }) => {
      const res = await fetch(`/api/shelves/${shelfId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update shelf");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    },
  });

  // Delete shelf mutation
  const deleteShelf = useMutation({
    mutationFn: async (shelfId: string) => {
      const res = await fetch(`/api/shelves/${shelfId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete shelf");
      return res.json();
    },
    onSuccess: () => {
      setSelectedShelfId(null);
      queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    },
  });

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.25));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleUpdateShelf = (shelfId: string, updates: Partial<Shelf>) => {
    updateShelf.mutate({ shelfId, updates });
  };

  const handleDeleteShelf = () => {
    if (
      selectedShelfId &&
      confirm("Are you sure you want to delete this shelf and all its items?")
    ) {
      deleteShelf.mutate(selectedShelfId);
    }
  };

  const handleRotateLeft = () => {
    if (!selectedShelfId || !warehouse) return;
    const shelf = warehouse.shelves.find((s) => s.id === selectedShelfId);
    if (shelf) {
      const newRotation = ((shelf.rotation || 0) - 90 + 360) % 360;
      handleUpdateShelf(selectedShelfId, { rotation: newRotation });
    }
  };

  const handleRotateRight = () => {
    if (!selectedShelfId || !warehouse) return;
    const shelf = warehouse.shelves.find((s) => s.id === selectedShelfId);
    if (shelf) {
      const newRotation = ((shelf.rotation || 0) + 90) % 360;
      handleUpdateShelf(selectedShelfId, { rotation: newRotation });
    }
  };

  const selectedShelf = warehouse?.shelves.find(
    (s) => s.id === selectedShelfId,
  );

  return (
    <div className="flex h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-white p-6">
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
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f5]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <Link
              href="/warehouse"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-black">
                {warehouse?.name || "Loading..."}
              </h1>
              <p className="text-gray-600">
                Interactive 2D floor plan with shelf management
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex min-w-0 flex-1 flex-col p-6">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
              </div>
            ) : !warehouse ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-white p-12">
                <WarehouseIcon className="mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  Warehouse not found
                </h3>
                <p className="mb-6 text-gray-500">
                  This warehouse may have been deleted or does not exist
                </p>
                <Link href="/warehouse">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Zones
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="mb-4">
                  <WarehouseToolbar
                    scale={scale}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onReset={handleResetView}
                    onAddShelf={() => createShelf.mutate(warehouse.id)}
                    selectedShelfId={selectedShelfId}
                    onDeleteShelf={handleDeleteShelf}
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                  />
                </div>

                {/* Canvas */}
                <div className="flex-1 rounded-xl bg-white p-4 shadow-sm">
                  <WarehouseCanvas
                    warehouse={warehouse}
                    shelves={warehouse.shelves}
                    selectedShelfId={selectedShelfId}
                    onSelectShelf={setSelectedShelfId}
                    onUpdateShelf={handleUpdateShelf}
                    scale={scale}
                    position={position}
                    onScaleChange={setScale}
                    onPositionChange={setPosition}
                  />
                </div>
              </>
            )}
          </div>

          {/* Inventory Panel */}
          {selectedShelf && (
            <ShelfInventoryPanel
              shelf={selectedShelf}
              onClose={() => setSelectedShelfId(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default WarehouseMapPage;
