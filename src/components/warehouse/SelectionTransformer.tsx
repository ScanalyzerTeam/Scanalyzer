"use client";

import Konva from "konva";
import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";

interface SelectionTransformerProps {
  selectedNode: Konva.Node | null;
  onTransformEnd?: (attrs: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation: number;
  }) => void;
}

export function SelectionTransformer({
  selectedNode,
  onTransformEnd,
}: SelectionTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedNode]);

  const handleTransformEnd = () => {
    if (!selectedNode || !onTransformEnd) return;

    const node = selectedNode;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Check if this was a resize operation (scale changed) or just rotation/move
    const wasResized =
      Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01;

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    // Only calculate new dimensions if actually resized
    let width: number | undefined;
    let height: number | undefined;

    if (wasResized) {
      // For Groups, get dimensions from children (the Rect inside)
      if (node.getClassName() === "Group") {
        const group = node as Konva.Group;
        const rect = group.findOne("Rect");
        if (rect) {
          width = Math.round(rect.width() * scaleX);
          height = Math.round(rect.height() * scaleY);
          // Also update the rect's dimensions
          rect.width(width);
          rect.height(height);
        }
      } else {
        width = Math.round(node.width() * scaleX);
        height = Math.round(node.height() * scaleY);
      }

      // Guard against too small dimensions
      if (width && width < 30) width = 30;
      if (height && height < 30) height = 30;
    }

    onTransformEnd({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width,
      height,
      rotation: Math.round(node.rotation()),
    });
  };

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
        "top-center",
        "bottom-center",
      ]}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit minimum size
        if (newBox.width < 30 || newBox.height < 30) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={handleTransformEnd}
    />
  );
}
