"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutList, MapPin, Warehouse as WarehouseIcon } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("scanner");

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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFC107]/10">
          <MapPin className="h-4 w-4 text-[#B8860B]" />
        </div>
        <h3 className="font-semibold text-gray-800">
          {t("destination") ?? "Destination"}
        </h3>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label
            htmlFor="scanner-warehouse"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500"
          >
            <WarehouseIcon className="h-3.5 w-3.5" />
            {t("warehouseLabel")}
          </label>
          <select
            id="scanner-warehouse"
            value={warehouseId}
            onChange={(e) => {
              onWarehouseChange(e.target.value);
              onShelfChange("");
            }}
            disabled={loadingWarehouses}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 transition focus:border-[#FFC107] focus:bg-white focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none disabled:opacity-50"
          >
            <option value="">{t("selectWarehouse")}</option>
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
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500"
          >
            <LayoutList className="h-3.5 w-3.5" />
            {t("shelfLabel")}
          </label>
          <select
            id="scanner-shelf"
            value={shelfId}
            onChange={(e) => onShelfChange(e.target.value)}
            disabled={!warehouseId || loadingShelves}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 transition focus:border-[#FFC107] focus:bg-white focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {!warehouseId
                ? t("selectWarehouseFirst")
                : loadingShelves
                  ? t("loading")
                  : t("selectShelf")}
            </option>
            {shelves.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
