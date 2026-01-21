// Types for the warehouse feature

export interface Warehouse {
  id: string;
  userId: string;
  name: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shelf {
  id: string;
  warehouseId: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  depth: number;
  rotation: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  shelfId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  isContainer: boolean;
  quantity: number;
  path: string;
  depth: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tree structure for hierarchical item display
export interface ItemTreeNode extends Item {
  children: ItemTreeNode[];
}

// Canvas state types
export interface CanvasState {
  scale: number;
  position: { x: number; y: number };
  selectedShelfId: string | null;
}

// Form types
export interface CreateWarehouseInput {
  name: string;
  width?: number;
  height?: number;
}

export interface UpdateWarehouseInput {
  name?: string;
  width?: number;
  height?: number;
}

export interface CreateShelfInput {
  warehouseId: string;
  name: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  depth?: number;
  rotation?: number;
  color?: string;
}

export interface UpdateShelfInput {
  name?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  depth?: number;
  rotation?: number;
  color?: string;
}

export interface CreateItemInput {
  shelfId: string;
  parentId?: string | null;
  name: string;
  description?: string;
  isContainer?: boolean;
  quantity?: number;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  isContainer?: boolean;
  quantity?: number;
  parentId?: string | null;
  sortOrder?: number;
}

// API response types
export interface WarehouseWithShelves extends Warehouse {
  shelves: Shelf[];
}

export interface ShelfWithItems extends Shelf {
  items: Item[];
}
