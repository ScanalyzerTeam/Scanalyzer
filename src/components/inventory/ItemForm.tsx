"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    isContainer: boolean;
    quantity: number;
    parentId: string | null;
  }) => void;
  parentId?: string | null;
  shelfName?: string;
}

export function ItemForm({
  open,
  onOpenChange,
  onSubmit,
  parentId = null,
  shelfName,
}: ItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isContainer, setIsContainer] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      isContainer,
      quantity: isContainer ? 1 : quantity,
      parentId,
    });

    // Reset form
    setName("");
    setDescription("");
    setIsContainer(false);
    setQuantity(1);
    onOpenChange(false);
  };

  const title = parentId
    ? "Add Item to Container"
    : shelfName
      ? `Add Item to ${shelfName}`
      : "Add Item";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Hammer, Box of Nails"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 16oz claw hammer"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isContainer"
                checked={isContainer}
                onChange={(e) => setIsContainer(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isContainer" className="cursor-pointer">
                This is a container (box, bin, etc.)
              </Label>
            </div>

            {!isContainer && (
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add {isContainer ? "Container" : "Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
