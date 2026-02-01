"use client";

import { Package, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SuggestedItem {
  name: string;
  description: string;
  quantity: number;
  isContainer: boolean;
  included: boolean;
  containedIn: string | null;
}

interface SuggestionsListProps {
  items: SuggestedItem[];
  onChange: (items: SuggestedItem[]) => void;
}

export function SuggestionsList({ items, onChange }: SuggestionsListProps) {
  const updateItem = (index: number, updates: Partial<SuggestedItem>) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    onChange(next);
  };

  const removeItem = (index: number) => {
    const removed = items[index];
    // If removing a container, clear containedIn for its children
    const next = items
      .filter((_, i) => i !== index)
      .map((item) =>
        item.containedIn === removed.name
          ? { ...item, containedIn: null }
          : item,
      );
    onChange(next);
  };

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        No items detected
      </p>
    );
  }

  const containerNames = items
    .filter((item) => item.isContainer && item.included)
    .map((item) => item.name);

  // Sort: containers first, then children grouped under their container
  const topLevel = items.filter((item) => !item.containedIn);
  const children = items.filter((item) => item.containedIn);

  const ordered: { item: SuggestedItem; originalIndex: number }[] = [];
  for (const item of topLevel) {
    const originalIndex = items.indexOf(item);
    ordered.push({ item, originalIndex });
    if (item.isContainer) {
      for (const child of children) {
        if (child.containedIn === item.name) {
          ordered.push({ item: child, originalIndex: items.indexOf(child) });
        }
      }
    }
  }
  // Add any children whose parent wasn't found in topLevel
  for (const child of children) {
    if (!ordered.some((o) => o.item === child)) {
      ordered.push({ item: child, originalIndex: items.indexOf(child) });
    }
  }

  return (
    <div className="space-y-3">
      {ordered.map(({ item, originalIndex }) => (
        <div
          key={originalIndex}
          className={`rounded-lg border p-4 transition ${
            item.included
              ? "border-gray-200 bg-white"
              : "border-gray-100 bg-gray-50 opacity-60"
          } ${item.containedIn ? "ml-6 border-l-4 border-l-[#FFC107]/40" : ""}`}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.included}
                  onChange={(e) =>
                    updateItem(originalIndex, { included: e.target.checked })
                  }
                  className="accent-[#FFC107]"
                />
                <span className="font-medium text-gray-700">Include</span>
              </label>
              {item.containedIn && (
                <span className="rounded-full bg-[#FFF9E6] px-2 py-0.5 text-xs font-medium text-[#B8860B]">
                  Inside: {item.containedIn}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(originalIndex)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`item-name-${originalIndex}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Name
              </label>
              <input
                id={`item-name-${originalIndex}`}
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItem(originalIndex, { name: e.target.value })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor={`item-desc-${originalIndex}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Description
              </label>
              <input
                id={`item-desc-${originalIndex}`}
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateItem(originalIndex, { description: e.target.value })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor={`item-qty-${originalIndex}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Quantity
              </label>
              <input
                id={`item-qty-${originalIndex}`}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(originalIndex, {
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 pb-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={item.isContainer}
                  onChange={(e) =>
                    updateItem(originalIndex, { isContainer: e.target.checked })
                  }
                  className="accent-[#FFC107]"
                />
                <Package className="h-4 w-4" />
                Container
              </label>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor={`item-parent-${originalIndex}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Inside container
              </label>
              <select
                id={`item-parent-${originalIndex}`}
                value={item.containedIn ?? ""}
                onChange={(e) =>
                  updateItem(originalIndex, {
                    containedIn: e.target.value || null,
                  })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              >
                <option value="">None (top-level)</option>
                {containerNames
                  .filter((name) => name !== item.name)
                  .map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
