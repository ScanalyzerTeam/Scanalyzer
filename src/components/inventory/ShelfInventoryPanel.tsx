"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Item,
  ItemTreeNode as ItemTreeNodeType,
  Shelf,
} from "@/lib/warehouse/types";

import type { ItemFormInitialData } from "./ItemForm";
import { ItemForm } from "./ItemForm";
import { ItemTree } from "./ItemTree";

interface ShelfInventoryPanelProps {
  shelf: Shelf;
  onClose: () => void;
}

export function ShelfInventoryPanel({
  shelf,
  onClose,
}: ShelfInventoryPanelProps) {
  const queryClient = useQueryClient();
  const [showItemForm, setShowItemForm] = useState(false);
  const [parentIdForNewItem, setParentIdForNewItem] = useState<string | null>(
    null,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] =
    useState<ItemFormInitialData | null>(null);

  // Fetch items for this shelf
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["items", shelf.id],
    queryFn: async () => {
      const res = await fetch(`/api/items?shelfId=${shelf.id}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Create item mutation
  const createItem = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      isContainer: boolean;
      quantity: number;
      parentId: string | null;
    }) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shelfId: shelf.id,
          ...data,
        }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", shelf.id] });
    },
  });

  // Delete item mutation
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", shelf.id] });
    },
  });

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description: string; quantity: number };
    }) => {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", shelf.id] });
    },
  });

  const handleAddItem = (parentId: string | null = null) => {
    setEditingItemId(null);
    setEditInitialData(null);
    setParentIdForNewItem(parentId);
    setShowItemForm(true);
  };

  const handleSubmitItem = (data: {
    name: string;
    description: string;
    isContainer: boolean;
    quantity: number;
    parentId: string | null;
  }) => {
    if (editingItemId) {
      updateItem.mutate({
        id: editingItemId,
        data: {
          name: data.name,
          description: data.description,
          quantity: data.quantity,
        },
      });
      setEditingItemId(null);
      setEditInitialData(null);
    } else {
      createItem.mutate(data);
    }
  };

  const handleEditItem = (item: ItemTreeNodeType) => {
    setEditingItemId(item.id);
    setEditInitialData({
      name: item.name,
      description: item.description || "",
      isContainer: item.isContainer,
      quantity: item.quantity,
    });
    setParentIdForNewItem(item.parentId ?? null);
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate(itemId);
    }
  };

  return (
    <div className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: shelf.color }}
          />
          <h3 className="font-semibold text-gray-900">{shelf.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total Items</span>
          <span className="font-medium text-gray-900">{items.length}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-gray-500">Containers</span>
          <span className="font-medium text-gray-900">
            {items.filter((i) => i.isContainer).length}
          </span>
        </div>
      </div>

      {/* Add Item Button */}
      <div className="border-b border-gray-200 p-4 text-gray-900">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleAddItem(null)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items Tree */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Package className="h-6 w-6 animate-pulse text-gray-400" />
          </div>
        ) : (
          <ItemTree
            items={items}
            onDelete={handleDeleteItem}
            onAddChild={handleAddItem}
            onEdit={handleEditItem}
          />
        )}
      </ScrollArea>

      {/* Item Form Dialog */}
      <ItemForm
        open={showItemForm}
        onOpenChange={(open) => {
          setShowItemForm(open);
          if (!open) {
            setEditingItemId(null);
            setEditInitialData(null);
          }
        }}
        onSubmit={handleSubmitItem}
        parentId={parentIdForNewItem}
        shelfName={shelf.name}
        initialData={editInitialData}
      />
    </div>
  );
}
