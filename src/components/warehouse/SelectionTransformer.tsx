"use client";

import Konva from "konva";
import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";

interface SelectionTransformerProps {
  selectedNode: Konva.Node | null;
  onTransformEnd?: (attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
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

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    // For Groups, get dimensions from the client rect or children
    let width = node.width();
    let height = node.height();

    // If node is a Group, get dimensions from its bounding box
    if (node.getClassName() === "Group") {
      const clientRect = node.getClientRect({ skipTransform: true });
      width = clientRect.width;
      height = clientRect.height;
    }

    // Apply scale to dimensions
    width = Math.round(width * scaleX);
    height = Math.round(height * scaleY);

    // Guard against zero dimensions
    if (width < 30) width = 100;
    if (height < 30) height = 50;

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
