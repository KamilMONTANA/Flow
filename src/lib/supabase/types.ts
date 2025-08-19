export type InventoryPayload = {
    id: string;
    [key: string]: any;
}

export type InventoryCategory = InventoryPayload;
export type InventoryEquipment = InventoryPayload;
export type InventoryCar = InventoryPayload;
