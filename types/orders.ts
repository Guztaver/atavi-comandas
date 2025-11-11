import React from 'react';
import { Order } from './index';

export interface SearchFilters {
  query: string;
  dateRange: { start: Date | null; end: Date | null };
  statuses: Order['status'][];
  types: Order['type'][];
  priceRange: { min: number; max: number };
  timeRange: { start: string; end: string };
}

export interface QuickFilter {
  label: string;
  filters: Partial<SearchFilters>;
  icon: React.ReactNode;
}

export interface OrderStats {
  total: number;
  revenue: number;
  averageOrderValue: number;
  orderCount: number;
  statusDistribution: Record<Order['status'], number>;
  typeDistribution: Record<Order['type'], number>;
}