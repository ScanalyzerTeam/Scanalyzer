"use client";

import { Minus, Plus, RotateCcw, RotateCw, Square, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface WarehouseToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onAddShelf: () => void;
  selectedShelfId: string | null;
  onDeleteShelf?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
}

export function WarehouseToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  onAddShelf,
  selectedShelfId,
  onDeleteShelf,
  onRotateLeft,
  onRotateRight,
}: WarehouseToolbarProps) {
  const t = useTranslations("warehouse");
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-gray-900 shadow-sm">
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        title={t("zoomIn")}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        title={t("zoomOut")}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[60px] text-center text-sm text-gray-600">
        {Math.round(scale * 100)}%
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        title={t("resetView")}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <Button
        variant="outline"
        size="sm"
        onClick={onAddShelf}
        title={t("addShelf")}
      >
        <Square className="mr-2 h-4 w-4" />
        {t("addShelf")}
      </Button>
      {selectedShelfId && (
        <>
          <div className="mx-2 h-6 w-px bg-gray-200 text-gray-800" />
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateLeft}
            title={t("rotateLeft")}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateRight}
            title={t("rotateRight")}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          {onDeleteShelf && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteShelf}
              className="text-red-600 hover:bg-red-100 hover:text-red-700"
              title={t("deleteSelectedShelf")}
            >
              {t("deleteSelectedShelf")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
