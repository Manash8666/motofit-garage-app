export interface User {
    id: string;
    username: string;
    email?: string;
    role: 'Owner' | 'Manager' | 'Staff';
    createdAt: Date;
}

export interface Job {
    id: string;
    jobNo: string;
    date: string;
    token?: string;
    promisedDate?: string;
    customer: string;
    phone: string;
    bikeModel: string;
    registration?: string;
    chassis?: string;
    engine?: string;
    mechanic: string;
    services: ServiceItem[];
    parts: PartItem[];
    estimatedCost: number;
    notes?: string;
    status: 'Pending' | 'Repairing' | 'Completed';
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceItem {
    name: string;
    price: number;
}

export interface PartItem {
    name: string;
    price: number;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    date: string;
    customer: string;
    amount: number;
    discount?: number;
    items?: InvoiceItem[];
    createdAt: Date;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    createdAt: Date;
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    price: number;
    lastUpdated: Date;
}

export interface Service {
    id: string;
    name: string;
    cost: number;
    description?: string;
}

export interface Bike {
    id: string;
    make: string;
    model: string;
    cc: number;
    imageUrl?: string;
}

export interface Mechanic {
    id: string;
    name: string;
    isActive: boolean;
}

export interface TimeClockEntry {
    id: string;
    userId: string;
    username: string;
    action: 'IN' | 'OUT';
    timestamp: Date;
}
