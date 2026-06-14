"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

export interface ItemFormInitialData {
  name: string;
  description: string;
  isContainer: boolean;
  quantity: number;
}

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
  initialData?: ItemFormInitialData | null;
}

export function ItemForm({
  open,
  onOpenChange,
  onSubmit,
  parentId = null,
  shelfName,
  initialData = null,
}: ItemFormProps) {
  const t = useTranslations("suggestions");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isContainer, setIsContainer] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isEditing = initialData !== null;

  // Pre-populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setIsContainer(initialData.isContainer);
      setQuantity(initialData.quantity);
    } else {
      setName("");
      setDescription("");
      setIsContainer(false);
      setQuantity(1);
    }
  }, [initialData]);

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

  const title = isEditing
    ? t("editItem")
    : parentId
      ? t("addItemToContainer")
      : shelfName
        ? t("addItemToShelf", { shelf: shelfName })
        : t("addItem");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                {t("description")} ({t("optional")})
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isContainer"
                checked={isContainer}
                onChange={(e) => setIsContainer(e.target.checked)}
                disabled={isEditing}
                className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
              />
              <Label
                htmlFor="isContainer"
                className={`cursor-pointer ${isEditing ? "opacity-50" : ""}`}
              >
                {t("container")} ({t("containerHint")})
              </Label>
            </div>

            {!isContainer && (
              <div className="grid gap-2">
                <Label htmlFor="quantity">{t("quantity")}</Label>
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
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditing
                ? t("saveChanges")
                : isContainer
                  ? t("addContainer")
                  : t("addItem")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
