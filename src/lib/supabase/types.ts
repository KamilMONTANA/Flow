export type InventoryPayload = {
    id: string;
    [key: string]: unknown;
}

export type InventoryCategory = InventoryPayload;
export type InventoryEquipment = InventoryPayload;
export type InventoryCar = InventoryPayload;
