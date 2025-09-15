const runtimeWindow: any = typeof window !== 'undefined' ? window : {};
const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
let API_BASE_URL = envBase?.replace(/\/$/, '') || '';
if (!API_BASE_URL) {
    if (runtimeWindow?.location && runtimeWindow.location.port === '5173') {
        API_BASE_URL = '/api';
    } else if (runtimeWindow?.location) {
        API_BASE_URL = `${runtimeWindow.location.origin}/api`;
    } else {
        API_BASE_URL = 'http://localhost:3000/api';
    }
}

let tenantBasicEmail: string | null = null;
let tenantBasicPassword: string | null = null;

export function setTenantBasicAuth(email: string | null, password: string | null) {
    tenantBasicEmail = email;
    tenantBasicPassword = password;
}
export function clearTenantBasicAuth() {
    tenantBasicEmail = null;
    tenantBasicPassword = null;
}

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
    access_token?: string;
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

function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (tenantBasicEmail && tenantBasicPassword) {
        const encoded = btoa(`${tenantBasicEmail}:${tenantBasicPassword}`);
        headers['Authorization'] = `Basic ${encoded}`;
    }
    return headers;
}

async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: authHeaders(), credentials: 'include' });
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
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        credentials: 'include',
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

export const getTopCustomers = (limit = 5) => fetcher<Customer[]>(`${API_BASE_URL}/customers/top-spenders?limit=${limit}`);

export const getTenants = () => fetcher<Tenant[]>(`${API_BASE_URL}/tenants`);

export const createTenant = (newTenant: NewTenant) => poster<{ id: string; shop_domain: string; status: string; created_at: string; updated_at: string; has_access_token: boolean }>(`${API_BASE_URL}/tenants`, newTenant);
export const initTenant = (data: { shop_domain: string; access_token?: string; user_email: string; role?: string }) =>
    poster<{ tenant: { id: string; shop_domain: string; status: string; created_at: string; has_access_token: boolean }; user: { id: string; email: string; role: string }; password: string }>(`${API_BASE_URL}/tenants/init`, data);

export const listTenantUsers = (tenantId: string) => fetcher<{ id: string; email: string; role: string; created_at: string }[]>(`${API_BASE_URL}/tenants/${tenantId}/users`);
export const createTenantUser = (tenantId: string, data: { email: string; password: string; role?: string }) =>
    poster<{ user: { id: string; email: string; role: string } }>(`${API_BASE_URL}/tenants/${tenantId}/users`, data);

export const ingestData = (tenantId: string, data?: IngestBody) => {
    return fetch(`${API_BASE_URL}/tenants/${tenantId}/ingest`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        body: data ? JSON.stringify(data) : undefined,
    }).then(res => {
        if (!res.ok) {
            return res.json().catch(() => ({})).then(err => {
                throw new Error(err?.error || 'Ingestion failed');
            });
        }
        return res.json();
    });
};

export const getTenantLogs = (tenantId: string) => fetcher<SyncLog[]>(`${API_BASE_URL}/tenants/${tenantId}/logs`);

export const getTenantAnalytics = (tenantId: string) => fetcher<TenantAnalytics>(`${API_BASE_URL}/tenants/${tenantId}/analytics`);

export interface EventsSummaryDailyRow {
    day: string;
    checkout_started: string;
    cart_abandoned: string;
    orders: string;
    abandonment_rate: number;
    conversion_rate: number;
}
export interface EventsSummaryResponse {
    range_days: number;
    totals: { checkout_started: number; cart_abandoned: number; orders: number; abandonment_rate: number; conversion_rate: number };
    daily: EventsSummaryDailyRow[];
}

export interface RevenueOverTimeRow {
    day: string;
    revenue: number;
    orders: number;
    unique_customers: number;
    cumulative_revenue: number;
    cumulative_orders: number;
    aov: number;
}
export interface RevenueOverTimeResponse {
    range_days: number;
    daily: RevenueOverTimeRow[];
    totals: { revenue: number; orders: number; aov: number };
}

export const getEventsSummary = (tenantId: string, days = 30) =>
    fetcher<EventsSummaryResponse>(`${API_BASE_URL}/tenants/${tenantId}/events/summary?days=${days}`);

export const getRevenueOverTime = (tenantId: string, days = 30) =>
    fetcher<RevenueOverTimeResponse>(`${API_BASE_URL}/tenants/${tenantId}/metrics/revenue-over-time?days=${days}`);

export interface CustomerGrowthRow { day: string; new_customers: number; cumulative_customers: number; }
export interface CustomerGrowthResponse { range_days: number; daily: CustomerGrowthRow[]; total_new: number; }
export const getCustomerGrowth = (tenantId: string, days = 60) =>
    fetcher<CustomerGrowthResponse>(`${API_BASE_URL}/tenants/${tenantId}/metrics/customer-growth?days=${days}`);

export interface ProductGrowthRow { day: string; new_products: number; cumulative_products: number; }
export interface ProductGrowthResponse { range_days: number; daily: ProductGrowthRow[]; total_new: number; }
export const getProductGrowth = (tenantId: string, days = 60) =>
    fetcher<ProductGrowthResponse>(`${API_BASE_URL}/tenants/${tenantId}/metrics/product-growth?days=${days}`);

export interface KpisResponse {
    revenue: number;
    orders: number;
    unique_customers: number;
    aov: number;
    repeat_customer_rate: number;
    total_customers: number;
}
export const getKpis = (tenantId: string) => fetcher<KpisResponse>(`${API_BASE_URL}/tenants/${tenantId}/metrics/kpis`);

export const getHealth = () => fetcher<{ status: string }>(`http://localhost:3000/health`);

export interface ApiKeyMeta { id: string; label: string | null; created_at: string; last_used_at: string | null; revoked_at: string | null; }
export const generateTenantApiKey = (tenantId: string, label?: string) => poster<{ api_key: string; meta: any }>(`${API_BASE_URL}/tenants/${tenantId}/api-keys`, { label });
export const listTenantApiKeys = (tenantId: string) => fetcher<ApiKeyMeta[]>(`${API_BASE_URL}/tenants/${tenantId}/api-keys`);
export const revokeTenantApiKey = (tenantId: string, keyId: string) => poster<{ success: boolean }>(`${API_BASE_URL}/tenants/${tenantId}/api-keys/${keyId}/revoke`, {});
export const adminBootstrap = (email: string, password: string) => poster<{ user: any }>(`${API_BASE_URL}/admin/bootstrap`, { email, password });
export const adminLogin = (email: string, password: string) => poster<{ user: any; expires_at: string }>(`${API_BASE_URL}/admin/login`, { email, password });
export const adminLogout = () => poster<{ success: boolean }>(`${API_BASE_URL}/admin/logout`, {});
export const adminMe = () => fetcher<{ user: any }>(`${API_BASE_URL}/admin/me`);
export const authMe = () => fetcher<{ tenant: any; apiKeyId: string }>(`${API_BASE_URL}/auth/me`);
export const tenantMe = () => fetcher<{ tenant: any; user: any }>(`${API_BASE_URL}/tenant/me`);
export const lookupTenant = (shop: string) => fetcher<{ exists: boolean; tenant?: { id: string; shop_domain: string; has_access_token: boolean } }>(`${API_BASE_URL}/tenant/lookup?shop=${encodeURIComponent(shop)}`);

export const startShopifyInstall = async (shop: string) => {
    const res = await fetch(`${API_BASE_URL}/shopify/install?shop=${encodeURIComponent(shop)}`);
    if (!res.ok) {
        let detail = '';
        try { detail = (await res.json()).error || res.statusText; } catch { detail = res.statusText; }
        throw new Error(`Failed to get install URL: ${detail}`);
    }
    return res.json() as Promise<{ authorize_url: string; state: string; normalized_shop_domain?: string }>;
};

export const setTenantAccessToken = (token: string) => poster<{ tenant: any; updated: boolean }>(`${API_BASE_URL}/tenant/set-token`, { token });
