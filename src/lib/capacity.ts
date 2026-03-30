// Capacity management utilities - all calculated in code, no database storage

export const CAPACITY_LIMITS = {
  WAREHOUSE_SMALL: 1000,
  SHELF_SMALL: 100,

  WAREHOUSE_MEDIUM: 3000,
  SHELF_MEDIUM: 250,

  WAREHOUSE_DEFAULT: 3000,
  SHELF_DEFAULT: 250,
} as const;

/**
 * Calculate current item count for a shelf
 */
export function calculateShelfItemCount(shelfItems: any[]): number {
  return shelfItems.reduce((total, item) => total + (item.quantity || 1), 0);
}

/**
 * Calculate capacity info for a shelf
 */
export function getShelfCapacity(
  shelfName: string,
  items: any[],
  maxCapacity: number = CAPACITY_LIMITS.SHELF_DEFAULT,
) {
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

/**
 * Calculate capacity info for entire warehouse
 */
export function getWarehouseCapacity(
  warehouseName: string,
  sheaves: any[],
  maxCapacity: number = CAPACITY_LIMITS.WAREHOUSE_DEFAULT,
) {
  let totalItems = 0;
  const shelfCapacities: any[] = [];

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
  const businessSize = maxCapacity <= CAPACITY_LIMITS.WAREHOUSE_SMALL ? 'small' :
                       maxCapacity <= CAPACITY_LIMITS.WAREHOUSE_MEDIUM ? 'medium' : 'large';

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

/**
 * Generate capacity suggestions based on utilization
 */
export function getCapacitySuggestions(
  utilizationPercent: number,
  entityName: string,
  entityType: 'warehouse' | 'shelf' = 'shelf',
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
