"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Warehouse as WarehouseIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ShelfInventoryPanel } from "@/components/inventory/ShelfInventoryPanel";
import { LangSwitcher } from "@/components/lang-switcher";
import { Button } from "@/components/ui/button";
import { WarehouseCanvas } from "@/components/warehouse/WarehouseCanvas";
import { WarehouseToolbar } from "@/components/warehouse/WarehouseToolbar";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Shelf, WarehouseWithShelves } from "@/lib/warehouse/types";

const WarehouseMapPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tWarehouse = useTranslations("warehouse");
  const queryClient = useQueryClient();
  const warehouseId = params.id as string;

  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create shelf");
      }
      return res.json();
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

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

  const deleteShelf = useMutation({
    mutationFn: async (shelfId: string) => {
      const res = await fetch(`/api/shelves/${shelfId}`, { method: "DELETE" });
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
    if (selectedShelfId && confirm(tWarehouse("confirmDelete"))) {
      deleteShelf.mutate(selectedShelfId);
    }
  };

  const handleRotateLeft = () => {
    if (!selectedShelfId || !warehouse) return;
    const shelf = warehouse.shelves.find((s) => s.id === selectedShelfId);
    if (shelf)
      handleUpdateShelf(selectedShelfId, {
        rotation: ((shelf.rotation || 0) - 90 + 360) % 360,
      });
  };

  const handleRotateRight = () => {
    if (!selectedShelfId || !warehouse) return;
    const shelf = warehouse.shelves.find((s) => s.id === selectedShelfId);
    if (shelf)
      handleUpdateShelf(selectedShelfId, {
        rotation: ((shelf.rotation || 0) + 90) % 360,
      });
  };

  const selectedShelf = warehouse?.shelves.find(
    (s) => s.id === selectedShelfId,
  );
  const totalItems =
    warehouse?.shelves.reduce(
      (sum, s) => sum + ((s as { _count?: { inventoryItems?: number } })._count?.inventoryItems ?? 0),
      0,
    ) ?? 0;

  return (
    <div className="flex h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-white p-6 shadow-sm">
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
          <span className="font-semibold text-black">
            {tNav("ai-assistant")}
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname?.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFF9E6] text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {tNav(item.href.replace("/", ""))}
              </Link>
            );
          })}
        </nav>

        <LangSwitcher />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-800"
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
          {tNav("logout")}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f8fa]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/warehouse"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-black">
                {warehouse?.name || tWarehouse("loadingZones")}
              </h1>
              <p className="text-sm text-gray-500">{tWarehouse("subtitle")}</p>
            </div>
          </div>

          {/* Inline stats */}
          {warehouse && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  {tWarehouse("shelves") ?? "Shelves"}
                </p>
                <p className="text-lg font-bold text-black">
                  {warehouse.shelves.length}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-right">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  {tWarehouse("items") ?? "Items"}
                </p>
                <p className="text-lg font-bold text-black">{totalItems}</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-right">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  {tWarehouse("dimensions") ?? "Size"}
                </p>
                <p className="text-lg font-bold text-black">
                  {warehouse.width}×{warehouse.height}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
            {isLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#FFC107]" />
                <p className="text-sm text-gray-400">
                  {tWarehouse("loadingZones")}
                </p>
              </div>
            ) : !warehouse ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50">
                  <WarehouseIcon className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-700">
                  {tWarehouse("warehouseNotFound")}
                </h3>
                <p className="mb-6 text-sm text-gray-400">
                  {tWarehouse("warehouseNotFoundDesc")}
                </p>
                <Link href="/warehouse">
                  <Button size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {tWarehouse("backToZones")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
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

                {/* Canvas with dot-grid background */}
                <div
                  className="relative flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                >
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

                  {/* Scale badge */}
                  <div className="absolute right-4 bottom-4 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
                    {Math.round(scale * 100)}%
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Inventory Panel */}
          {selectedShelf && (
            <div className="animate-in slide-in-from-right-4 duration-200">
              <ShelfInventoryPanel
                shelf={selectedShelf}
                warehouseId={warehouseId}
                onClose={() => setSelectedShelfId(null)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WarehouseMapPage;
