"use client";

import { Line } from "react-konva";

interface GridLayerProps {
  width: number;
  height: number;
  gridSize?: number;
}

export function GridLayer({ width, height, gridSize = 50 }: GridLayerProps) {
  const lines = [];

  // Vertical lines
  for (let i = 0; i <= width / gridSize; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, height]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />,
    );
  }

  // Horizontal lines
  for (let i = 0; i <= height / gridSize; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * gridSize, width, i * gridSize]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />,
    );
  }

  return <>{lines}</>;
}
