"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ItemTreeNode as ItemTreeNodeType } from "@/lib/warehouse/types";

interface ItemTreeNodeProps {
  item: ItemTreeNodeType;
  onDelete: (itemId: string) => void;
  onAddChild?: (parentId: string) => void;
}

export function ItemTreeNode({
  item,
  onDelete,
  onAddChild,
}: ItemTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="select-none">
      <div
        className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-gray-100"
        style={{ paddingLeft: `${item.depth * 16 + 8}px` }}
      >
        {item.isContainer ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200"
          >
            {hasChildren || item.isContainer ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="h-5 w-5" />
        )}

        {item.isContainer ? (
          <Folder className="h-4 w-4 text-yellow-500" />
        ) : (
          <Package className="h-4 w-4 text-blue-500" />
        )}

        <span className="ml-1 flex-1 truncate text-sm text-gray-800">
          {item.name}
        </span>

        {!item.isContainer && item.quantity > 1 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            x{item.quantity}
          </span>
        )}

        {item.isContainer && onAddChild && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(item.id)}
            className="h-6 w-6 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            title="Add item inside"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {item.isContainer && isExpanded && hasChildren && (
        <div>
          {item.children.map((child) => (
            <ItemTreeNode
              key={child.id}
              item={child}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
