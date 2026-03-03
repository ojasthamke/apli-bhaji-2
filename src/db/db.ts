import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Area {
    id?: number;
    name: string;
    photoPath?: string;
    areaNumber?: string;
    createdAt: string;
}

export interface Street {
    id?: number;
    areaId: number;
    name: string;
    photoPath?: string;
    locationLink?: string;
    notes?: string;
    createdAt: string;
}

export interface Customer {
    id?: number;
    name: string;
    phone: string;
    address?: string;
    houseNumber?: string;
    areaId: number;
    streetId?: number;
    locationLink?: string;
    photoPath?: string;
    notes?: string;
    createdAt: string;
}

export interface Item {
    id?: number;
    name: string;
    category: 'Vegetable' | 'Medicine';
    price: number;
    mrp: number;
    costPrice?: number;
    unit: string;
    isEnabled: number; // 0 or 1
    isOffer?: boolean;
    createdAt: string;
}

export interface Order {
    id?: number;
    customerId: number;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    profit?: number;
    status: 'Pending' | 'Delivered' | 'Cancelled';
    dateTime: string;
    updatedAt: string;
}

export interface OrderItem {
    id?: number;
    orderId: number;
    itemId: number;
    quantity: number;
    price: number;
    mrp: number;
    costPrice?: number;
    total: number;
    profit?: number;
}

export class AppDB extends Dexie {
    areas!: Table<Area>;
    streets!: Table<Street>;
    customers!: Table<Customer>;
    items!: Table<Item>;
    orders!: Table<Order>;
    orderItems!: Table<OrderItem>;

    constructor() {
        super('ApliBhajiDB');
        this.version(1).stores({
            areas: '++id, name',
            customers: '++id, name, phone, areaId',
            items: '++id, name, category, isEnabled',
            orders: '++id, customerId, status, dateTime',
            orderItems: '++id, orderId, itemId'
        });

        this.version(2).stores({
            streets: '++id, areaId, name',
            customers: '++id, name, phone, areaId, streetId'
        }).upgrade(async tx => {
            const areas = await tx.table('areas').toArray();
            for (const area of areas) {
                const customers = await tx.table('customers').where({ areaId: area.id }).toArray();
                const unassignedCustomers = customers.filter((c: any) => !c.streetId);

                if (unassignedCustomers.length > 0) {
                    let mainStreetId;
                    const existingStreet = await tx.table('streets').where({ areaId: area.id, name: 'Main Street' }).first();
                    if (existingStreet) {
                        mainStreetId = existingStreet.id;
                    } else {
                        mainStreetId = await tx.table('streets').add({
                            areaId: area.id,
                            name: 'Main Street',
                            createdAt: new Date().toISOString()
                        });
                    }

                    for (const c of unassignedCustomers) {
                        c.streetId = mainStreetId;
                        await tx.table('customers').put(c);
                    }
                }
            }
        });
    }
}

export const db = new AppDB();
