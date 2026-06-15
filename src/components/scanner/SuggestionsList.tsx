"use client";

import { ChevronDown, Package, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("suggestions");

  const updateItem = (index: number, updates: Partial<SuggestedItem>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const removeItem = (index: number) => {
    const removed = items[index];
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
      <p className="py-8 text-center text-sm text-gray-400">{t("noItems")}</p>
    );
  }

  const containerNames = items
    .filter((item) => item.isContainer && item.included)
    .map((item) => item.name);

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
  for (const child of children) {
    if (!ordered.some((o) => o.item === child)) {
      ordered.push({ item: child, originalIndex: items.indexOf(child) });
    }
  }

  return (
    <div className="space-y-2">
      {ordered.map(({ item, originalIndex }) => (
        <div
          key={originalIndex}
          className={`rounded-xl border transition-all ${
            item.containedIn ? "ml-5 border-l-[3px] border-l-[#FFC107]/50" : ""
          } ${
            item.included
              ? "border-gray-200 bg-white shadow-sm"
              : "border-gray-100 bg-gray-50/80 opacity-55"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={item.included}
              onClick={() =>
                updateItem(originalIndex, { included: !item.included })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                item.included ? "bg-[#FFC107]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  item.included ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>

            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              {t("include")}
            </span>

            {item.containedIn && (
              <span className="ml-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                ↳ {item.containedIn}
              </span>
            )}

            {item.isContainer && (
              <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                <Package className="h-3 w-3" />
                {t("container")}
              </span>
            )}

            <button
              type="button"
              onClick={() => removeItem(originalIndex)}
              className="ml-auto rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3">
            {/* Name */}
            <div className="col-span-12 sm:col-span-4">
              <label className="mb-1 block text-xs font-medium text-gray-400">
                {t("name")}
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItem(originalIndex, { name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition focus:border-[#FFC107] focus:bg-white focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="col-span-12 sm:col-span-5">
              <label className="mb-1 block text-xs font-medium text-gray-400">
                {t("description")}
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateItem(originalIndex, { description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition focus:border-[#FFC107] focus:bg-white focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="col-span-6 sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-400">
                {t("quantity")}
              </label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(originalIndex, {
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition focus:border-[#FFC107] focus:bg-white focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
              />
            </div>

            {/* Container toggle */}
            <div className="col-span-6 flex items-end pb-0.5 sm:col-span-1">
              <label className="flex cursor-pointer flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-400">
                  {t("container")}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.isContainer}
                  onClick={() =>
                    updateItem(originalIndex, {
                      isContainer: !item.isContainer,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    item.isContainer ? "bg-[#FFC107]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      item.isContainer ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Inside container */}
            {containerNames.length > 0 && (
              <div className="relative col-span-12">
                <label className="mb-1 block text-xs font-medium text-gray-400"></label>
                <div className="relative"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
