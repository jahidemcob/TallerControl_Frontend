export type InventoryItemType = 'Repuesto' | 'Consumible';

export type InventoryMovementType = 'Entrada' | 'Salida' | 'AjustePositivo' | 'AjusteNegativo';

export interface InventoryCategory {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryCategoryRequest {
  name: string;
  description: string;
}

export interface InventoryItem {
  id: number;
  categoryId: number;
  categoryName: string;
  code: string;
  name: string;
  itemType: InventoryItemType;
  brand: string | null;
  description: string | null;
  availableQuantity: number;
  minimumStock: number;
  isLowStock: boolean;
  purchaseCost: number;
  salePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryItemRequest {
  categoryId: number;
  code: string;
  name: string;
  itemType: InventoryItemType;
  brand: string;
  description: string;
  minimumStock: number;
  purchaseCost: number;
  salePrice: number;
}

export interface InventoryItemFilters {
  categoryId?: number | null;
  itemType?: InventoryItemType | '' | null;
  includeInactive?: boolean;
  onlyLowStock?: boolean;
  search?: string;
}

export interface InventoryEntryRequest {
  inventoryItemId: number;
  quantity: number;
  unitCost: number;
  reason: string;
}

export interface InventoryAdjustmentRequest {
  inventoryItemId: number;
  quantity: number;
  increaseStock: boolean;
  reason: string;
}

export interface InventoryExitRequest {
  inventoryItemId: number;
  quantity: number;
  reason: string;
}

export interface InventoryMovement {
  id: number;
  inventoryItemId: number;
  itemCode: string;
  itemName: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCost: number | null;
  movementDate: string;
  reason: string;
  appointmentId: number | null;
  userId: number;
  appointmentInventoryItemId: number | null;
}

export interface InventoryMovementFilters {
  inventoryItemId?: number | null;
  movementType?: InventoryMovementType | '' | null;
  from?: string;
  to?: string;
}

export interface AppointmentInventoryItemRequest {
  inventoryItemId: number;
  quantity: number;
}

export interface UpdateAppointmentInventoryItemRequest {
  quantity: number;
}

export interface AppointmentInventoryItem {
  id: number;
  appointmentId: number;
  inventoryItemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  subtotal: number;
  userId: number;
  recordedAt: string;
  inventoryProcessed: boolean;
  inventoryProcessedAt: string | null;
}

export interface InventoryApiError {
  status?: number;
  error?: string;
  message?: string;
  timestamp?: string;
}
