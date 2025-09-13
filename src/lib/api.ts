const API_BASE_URL = 'http://localhost:3000/api';

export interface Customer {
    id: string;
    name: string;
    email: string;
    total_spend: number;
}

export interface Order {
    id: string;
    order_number: number;
    total_price: number;
    created_at: string;
    customer: {
        first_name: string;
        last_name: string;
    };
}

export interface Stats {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
}

export interface Tenant {
    id: string;
    shop_domain: string;
}

export interface NewTenant {
    shop_domain: string;
    access_token: string;
}

export interface IngestBody {
    data_types?: ("customers" | "products" | "orders")[];
}

export interface SyncLog {
    timestamp: string;
    level: string;
    message: string;
}

export interface TenantAnalytics {
    total_customers: number;
    total_products: number;
    total_orders: number;
}

class FetchError extends Error {
    info: unknown;
    status: number;

    constructor(message: string, info: unknown, status: number) {
        super(message);
        this.info = info;
        this.status = status;
    }
}

async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        let errorInfo;
        try {
            errorInfo = await res.json();
        } catch {
            // The response was not JSON. Use status text.
        }

        const message = (errorInfo as { message?: string })?.message || (errorInfo as { error?: string })?.error || res.statusText;
        throw new FetchError(message || 'An error occurred while fetching the data.', errorInfo, res.status);
    }
    return res.json();
}

async function poster<T>(url: string, body: object): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        let errorInfo;
        try {
            errorInfo = await res.json();
        } catch {
            // The response was not JSON. Use status text.
        }

        const message = (errorInfo as { message?: string })?.message || (errorInfo as { error?: string })?.error || res.statusText;
        throw new FetchError(message || 'An error occurred while sending the data.', errorInfo, res.status);
    }
    return res.json();
}

export const getStats = () => fetcher<Stats>(`${API_BASE_URL}/stats`);

export const getOrders = (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetcher<Order[]>(`${API_BASE_URL}/orders?${params.toString()}`);
};

export const getTopCustomers = () => fetcher<Customer[]>(`${API_BASE_URL}/customers/top-spenders`);

export const getTenants = () => fetcher<Tenant[]>(`${API_BASE_URL}/tenants`);

export const createTenant = (newTenant: NewTenant) => poster<Tenant>(`${API_BASE_URL}/tenants`, newTenant);

export const ingestData = (tenantId: string, data?: IngestBody) => {
    return fetch(`${API_BASE_URL}/tenants/${tenantId}/ingest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    }).then(res => {
        if (!res.ok) {
            throw new Error('Ingestion failed');
        }
        return res.json();
    });
};

export const getTenantLogs = (tenantId: string) => fetcher<SyncLog[]>(`${API_BASE_URL}/tenants/${tenantId}/logs`);

export const getTenantAnalytics = (tenantId: string) => fetcher<TenantAnalytics>(`${API_BASE_URL}/tenants/${tenantId}/analytics`);

export const getHealth = () => fetcher<{ status: string }>(`http://localhost:3000/health`);
