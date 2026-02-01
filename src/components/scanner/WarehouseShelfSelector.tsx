"use client";

import { useQuery } from "@tanstack/react-query";

interface Warehouse {
  id: string;
  name: string;
}

interface Shelf {
  id: string;
  name: string;
}

interface WarehouseShelfSelectorProps {
  warehouseId: string;
  shelfId: string;
  onWarehouseChange: (id: string) => void;
  onShelfChange: (id: string) => void;
}

export function WarehouseShelfSelector({
  warehouseId,
  shelfId,
  onWarehouseChange,
  onShelfChange,
}: WarehouseShelfSelectorProps) {
  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery<
    Warehouse[]
  >({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouse");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  const { data: shelves = [], isLoading: loadingShelves } = useQuery<Shelf[]>({
    queryKey: ["shelves", warehouseId],
    queryFn: async () => {
      const res = await fetch(`/api/shelves?warehouseId=${warehouseId}`);
      if (!res.ok) throw new Error("Failed to fetch shelves");
      return res.json();
    },
    enabled: !!warehouseId,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <div className="flex-1">
        <label
          htmlFor="scanner-warehouse"
          className="mb-1 block text-xs font-medium text-gray-500"
        >
          Warehouse
        </label>
        <select
          id="scanner-warehouse"
          value={warehouseId}
          onChange={(e) => {
            onWarehouseChange(e.target.value);
            onShelfChange("");
          }}
          disabled={loadingWarehouses}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none"
        >
          <option value="">Select warehouse...</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label
          htmlFor="scanner-shelf"
          className="mb-1 block text-xs font-medium text-gray-500"
        >
          Shelf
        </label>
        <select
          id="scanner-shelf"
          value={shelfId}
          onChange={(e) => onShelfChange(e.target.value)}
          disabled={!warehouseId || loadingShelves}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {!warehouseId
              ? "Select warehouse first..."
              : loadingShelves
                ? "Loading..."
                : "Select shelf..."}
          </option>
          {shelves.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
