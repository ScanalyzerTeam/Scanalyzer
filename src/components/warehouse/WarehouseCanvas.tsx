"use client";

import dynamic from "next/dynamic";

import type { Shelf, Warehouse } from "@/lib/warehouse/types";

// Dynamically import the entire Konva canvas to avoid SSR issues
const KonvaCanvas = dynamic(
  () => import("./KonvaCanvas").then((mod) => mod.KonvaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    ),
  },
);

interface WarehouseCanvasProps {
  warehouse: Warehouse;
  shelves: Shelf[];
  selectedShelfId: string | null;
  onSelectShelf: (shelfId: string | null) => void;
  onUpdateShelf: (
    shelfId: string,
    updates: Partial<Shelf>,
  ) => void | Promise<void>;
  scale: number;
  position: { x: number; y: number };
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function WarehouseCanvas({
  warehouse,
  shelves,
  selectedShelfId,
  onSelectShelf,
  onUpdateShelf,
  scale,
  position,
  onScaleChange,
  onPositionChange,
}: WarehouseCanvasProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
      <KonvaCanvas
        warehouse={warehouse}
        shelves={shelves}
        selectedShelfId={selectedShelfId}
        onSelectShelf={onSelectShelf}
        onUpdateShelf={onUpdateShelf}
        scale={scale}
        position={position}
        onScaleChange={onScaleChange}
        onPositionChange={onPositionChange}
      />
    </div>
  );
}
