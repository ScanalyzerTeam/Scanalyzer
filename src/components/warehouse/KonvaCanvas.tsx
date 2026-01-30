"use client";

import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";

import type { Shelf, Warehouse } from "@/lib/warehouse/types";

import { GridLayer } from "./GridLayer";
import { SelectionTransformer } from "./SelectionTransformer";
import { ShelfShape } from "./ShelfShape";

interface KonvaCanvasProps {
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

export function KonvaCanvas({
  warehouse,
  shelves,
  selectedShelfId,
  onSelectShelf,
  onUpdateShelf,
  scale,
  position,
  onScaleChange,
  onPositionChange,
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Konva.Node | null>(null);
  const [containerWidth, setContainerWidth] = useState(warehouse.width);
  const [containerHeight, setContainerHeight] = useState(warehouse.height);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      const scaleBy = 1.05;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(
        Math.max(oldScale * Math.pow(scaleBy, direction), 0.25),
        3,
      );

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      onScaleChange(newScale);
      onPositionChange(newPos);
    },
    [scale, position, onScaleChange, onPositionChange],
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Click on empty area - deselect
      if (e.target === e.target.getStage()) {
        onSelectShelf(null);
        setSelectedNode(null);
      }
    },
    [onSelectShelf],
  );

  const handleSelectShelf = useCallback(
    (shelfId: string, node: Konva.Node) => {
      onSelectShelf(shelfId);
      setSelectedNode(node);
    },
    [onSelectShelf],
  );

  const handleShelfDragEnd = useCallback(
    (shelfId: string, pos: { x: number; y: number }) => {
      onUpdateShelf(shelfId, {
        positionX: pos.x,
        positionY: pos.y,
      });
    },
    [onUpdateShelf],
  );

  const handleTransformEnd = useCallback(
    (attrs: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      rotation: number;
    }) => {
      if (!selectedShelfId) return;

      const updates: Partial<Shelf> = {
        positionX: attrs.x,
        positionY: attrs.y,
        rotation: attrs.rotation,
      };

      // Only update dimensions if they were changed (resize operation)
      if (attrs.width !== undefined) {
        updates.width = attrs.width;
      }
      if (attrs.height !== undefined) {
        updates.depth = attrs.height;
      }

      onUpdateShelf(selectedShelfId, updates);
    },
    [selectedShelfId, onUpdateShelf],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        onPositionChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }
    },
    [onPositionChange],
  );

  const gridWidth = Math.max(
    warehouse.width * 2,
    containerWidth / scale + Math.abs(position.x) / scale + 500,
  );
  const gridHeight = Math.max(
    warehouse.height * 2,
    containerHeight / scale + Math.abs(position.y) / scale + 500,
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage
        ref={stageRef}
        width={containerWidth}
        height={containerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          <GridLayer width={gridWidth} height={gridHeight} gridSize={25} />
        </Layer>
        <Layer>
          {shelves.map((shelf) => (
            <ShelfShape
              key={shelf.id}
              shelf={shelf}
              isSelected={selectedShelfId === shelf.id}
              onSelect={() => {
                // Use setTimeout to ensure the node is rendered before finding it
                setTimeout(() => {
                  const stage = stageRef.current;
                  if (stage) {
                    const node = stage.findOne(`#shelf-${shelf.id}`);
                    if (node) {
                      handleSelectShelf(shelf.id, node);
                    }
                  }
                }, 0);
                onSelectShelf(shelf.id);
              }}
              onDragEnd={(pos) => handleShelfDragEnd(shelf.id, pos)}
            />
          ))}
          <SelectionTransformer
            selectedNode={selectedNode}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
}
