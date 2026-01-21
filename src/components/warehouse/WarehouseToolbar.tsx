"use client";

import { Minus, Plus, RotateCcw, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WarehouseToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onAddShelf: () => void;
  selectedShelfId: string | null;
  onDeleteShelf?: () => void;
}

export function WarehouseToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  onAddShelf,
  selectedShelfId,
  onDeleteShelf,
}: WarehouseToolbarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <Button variant="outline" size="sm" onClick={onZoomIn} title="Zoom In">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onZoomOut} title="Zoom Out">
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[60px] text-center text-sm text-gray-600">
        {Math.round(scale * 100)}%
      </span>
      <Button variant="outline" size="sm" onClick={onReset} title="Reset View">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <Button
        variant="outline"
        size="sm"
        onClick={onAddShelf}
        title="Add Shelf"
      >
        <Square className="mr-2 h-4 w-4" />
        Add Shelf
      </Button>
      {selectedShelfId && onDeleteShelf && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteShelf}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          title="Delete Selected Shelf"
        >
          Delete
        </Button>
      )}
    </div>
  );
}
