"use client";

import Konva from "konva";
import { useRef } from "react";
import { Group, Rect, Text } from "react-konva";

import type { Shelf } from "@/lib/warehouse/types";

interface ShelfShapeProps {
  shelf: Shelf;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onTransformEnd?: (attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }) => void;
}

export function ShelfShape({
  shelf,
  isSelected,
  onSelect,
  onDragEnd,
}: ShelfShapeProps) {
  const shapeRef = useRef<Konva.Rect>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
    });
  };

  return (
    <Group
      id={`shelf-${shelf.id}`}
      x={shelf.positionX}
      y={shelf.positionY}
      rotation={shelf.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
    >
      <Rect
        ref={shapeRef}
        width={shelf.width}
        height={shelf.depth}
        fill={shelf.color}
        stroke={isSelected ? "#FFC107" : "#1f2937"}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={isSelected ? 10 : 5}
        shadowOpacity={0.2}
        shadowOffsetX={2}
        shadowOffsetY={2}
        name="shelf"
      />
      <Text
        text={shelf.name}
        fontSize={14}
        fontStyle="bold"
        fill="#ffffff"
        width={shelf.width}
        height={shelf.depth}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
}
