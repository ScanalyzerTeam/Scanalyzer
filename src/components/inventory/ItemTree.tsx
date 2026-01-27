"use client";

import type {
  Item,
  ItemTreeNode as ItemTreeNodeType,
} from "@/lib/warehouse/types";

import { ItemTreeNode } from "./ItemTreeNode";

interface ItemTreeProps {
  items: Item[];
  onDelete: (itemId: string) => void;
  onAddChild?: (parentId: string) => void;
  onEdit?: (item: ItemTreeNodeType) => void;
}

// Build tree structure from flat items array
function buildTree(items: Item[]): ItemTreeNodeType[] {
  const itemMap = new Map<string, ItemTreeNodeType>();
  const roots: ItemTreeNodeType[] = [];

  // First pass: create all nodes
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build tree structure
  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by sortOrder
  const sortChildren = (nodes: ItemTreeNodeType[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);

  return roots;
}

export function ItemTree({
  items,
  onDelete,
  onAddChild,
  onEdit,
}: ItemTreeProps) {
  const treeNodes = buildTree(items);

  if (treeNodes.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No items on this shelf yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {treeNodes.map((node) => (
        <ItemTreeNode
          key={node.id}
          item={node}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
