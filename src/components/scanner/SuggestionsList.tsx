"use client";

import { Package, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SuggestedItem {
  name: string;
  description: string;
  quantity: number;
  isContainer: boolean;
  included: boolean;
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
    onChange(items.filter((_, i) => i !== index));
  };

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        No items detected
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 transition ${
            item.included
              ? "border-gray-200 bg-white"
              : "border-gray-100 bg-gray-50 opacity-60"
          }`}
        >
          <div className="mb-3 flex items-start justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.included}
                onChange={(e) =>
                  updateItem(index, { included: e.target.checked })
                }
                className="accent-[#FFC107]"
              />
              <span className="font-medium text-gray-700">Include</span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`item-name-${index}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Name
              </label>
              <input
                id={`item-name-${index}`}
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor={`item-desc-${index}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Description
              </label>
              <input
                id={`item-desc-${index}`}
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, { description: e.target.value })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor={`item-qty-${index}`}
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Quantity
              </label>
              <input
                id={`item-qty-${index}`}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, {
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-black focus:border-[#FFC107] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={item.isContainer}
                  onChange={(e) =>
                    updateItem(index, { isContainer: e.target.checked })
                  }
                  className="accent-[#FFC107]"
                />
                <Package className="h-4 w-4" />
                Container
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
