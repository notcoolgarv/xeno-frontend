import { useQuery } from '@tanstack/react-query';
import { getEventsSummary, getRevenueOverTime, getCustomerGrowth, getProductGrowth, getKpis } from './api';
import type {
  EventsSummaryResponse,
  RevenueOverTimeResponse,
  CustomerGrowthResponse,
  ProductGrowthResponse,
  KpisResponse
} from './api';

interface WindowConfig { enabled?: boolean }

export function useEventsSummary(tenantId: string | null, days: number, cfg: WindowConfig = {}) {
  return useQuery<EventsSummaryResponse>({
    queryKey: ['events-summary', tenantId, days],
    queryFn: () => getEventsSummary(tenantId as string, days),
    enabled: !!tenantId && (cfg.enabled ?? true)
  });
}

export function useRevenueOverTime(tenantId: string | null, days: number, cfg: WindowConfig = {}) {
  return useQuery<RevenueOverTimeResponse>({
    queryKey: ['revenue-over-time', tenantId, days],
    queryFn: () => getRevenueOverTime(tenantId as string, days),
    enabled: !!tenantId && (cfg.enabled ?? true)
  });
}

export function useCustomerGrowth(tenantId: string | null, days: number, cfg: WindowConfig = {}) {
  return useQuery<CustomerGrowthResponse>({
    queryKey: ['customer-growth', tenantId, days],
    queryFn: () => getCustomerGrowth(tenantId as string, days),
    enabled: !!tenantId && (cfg.enabled ?? true)
  });
}

export function useProductGrowth(tenantId: string | null, days: number, cfg: WindowConfig = {}) {
  return useQuery<ProductGrowthResponse>({
    queryKey: ['product-growth', tenantId, days],
    queryFn: () => getProductGrowth(tenantId as string, days),
    enabled: !!tenantId && (cfg.enabled ?? true)
  });
}

export function useKpis(tenantId: string | null, cfg: WindowConfig = {}) {
  return useQuery<KpisResponse>({
    queryKey: ['kpis', tenantId],
    queryFn: () => getKpis(tenantId as string),
    enabled: !!tenantId && (cfg.enabled ?? true)
  });
}
