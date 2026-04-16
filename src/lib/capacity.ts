
export const CAPACITY_LIMITS = {
  WAREHOUSE_SMALL: 1000,
  SHELF_SMALL: 100,

  WAREHOUSE_MEDIUM: 3000,
  SHELF_MEDIUM: 250,

  WAREHOUSE_DEFAULT: 3000,
  SHELF_DEFAULT: 250,
} as const;


type ShelfItem = {
  quantity?: number;
  [key: string]: unknown;
};

type Shelf = {
  name: string;
  items?: ShelfItem[];
};

type ShelfCapacity = {
  shelfName: string;
  currentItems: number;
  maxCapacity: number;
  remainingCapacity: number;
  utilizationPercent: number;
};

type WarehouseCapacity = {
  warehouseName: string;
  currentItems: number;
  maxCapacity: number;
  remainingCapacity: number;
  utilizationPercent: number;
  businessSize: "small" | "medium" | "large";
  shelves: ShelfCapacity[];
};


export function calculateShelfItemCount(shelfItems: ShelfItem[]): number {
  return shelfItems.reduce((total, item) => total + (item.quantity || 1), 0);
}


export function getShelfCapacity(
  shelfName: string,
  items: ShelfItem[],
  maxCapacity: number = CAPACITY_LIMITS.SHELF_DEFAULT,
): ShelfCapacity {
  const currentItems = calculateShelfItemCount(items);
  const remainingCapacity = maxCapacity - currentItems;
  const utilizationPercent = Math.round((currentItems / maxCapacity) * 100);

  return {
    shelfName,
    currentItems,
    maxCapacity,
    remainingCapacity,
    utilizationPercent,
  };
}


export function getWarehouseCapacity(
  warehouseName: string,
  sheaves: Shelf[],
  maxCapacity: number = CAPACITY_LIMITS.WAREHOUSE_DEFAULT,
): WarehouseCapacity {
  let totalItems = 0;
  const shelfCapacities: ShelfCapacity[] = [];

  for (const shelf of sheaves) {
    const shelfCapacity = getShelfCapacity(
      shelf.name,
      shelf.items || [],
      CAPACITY_LIMITS.SHELF_DEFAULT,
    );
    shelfCapacities.push(shelfCapacity);
    totalItems += shelfCapacity.currentItems;
  }

  const remainingCapacity = maxCapacity - totalItems;
  const utilizationPercent = Math.round((totalItems / maxCapacity) * 100);

  const businessSize: "small" | "medium" | "large" =
    maxCapacity <= CAPACITY_LIMITS.WAREHOUSE_SMALL
      ? "small"
      : maxCapacity <= CAPACITY_LIMITS.WAREHOUSE_MEDIUM
        ? "medium"
        : "large";

  return {
    warehouseName,
    currentItems: totalItems,
    maxCapacity,
    remainingCapacity,
    utilizationPercent,
    businessSize,
    shelves: shelfCapacities,
  };
}

export function getCapacitySuggestions(
  utilizationPercent: number,
  entityName: string,
): string[] {
  const suggestions: string[] = [];

  if (utilizationPercent >= 90) {
    suggestions.push(
      `⚠️ ${entityName} is at ${utilizationPercent}% capacity. Consider reorganizing or expanding.`,
    );
  } else if (utilizationPercent >= 75) {
    suggestions.push(
      `🔶 ${entityName} is at ${utilizationPercent}% capacity. Monitor closely.`,
    );
  } else if (utilizationPercent < 30) {
    suggestions.push(
      `💡 ${entityName} is only at ${utilizationPercent}% capacity. Consider consolidating items.`,
    );
  }

  return suggestions;
}
