import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Area {
    id?: number;
    name: string;
    photoPath?: string;
    areaNumber?: string;
    createdAt: string;
}

export interface Customer {
    id?: number;
    name: string;
    phone: string;
    address?: string;
    houseNumber?: string;
    areaId: number;
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
    unit: string;
    isEnabled: number; // 0 or 1
    createdAt: string;
}

export interface Order {
    id?: number;
    customerId: number;
    totalAmount: number;
    discount: number;
    finalAmount: number;
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
    total: number;
}

export class AppDB extends Dexie {
    areas!: Table<Area>;
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
    }
}

export const db = new AppDB();
