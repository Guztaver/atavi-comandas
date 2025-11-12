'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/types';
import { BetterAuthStorageService } from '@/lib/better-auth-storage';
import { SearchFilters } from '@/types/orders';
import { OrderFilters } from '../utils/orderFilters';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { start: null, end: null },
    statuses: [],
    types: [],
    priceRange: { min: 0, max: 1000 },
    timeRange: { start: '00:00', end: '23:59' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await BetterAuthStorageService.getOrders();
      // Sort by date descending (newest first)
      const sortedOrders = allOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return OrderFilters.filterOrders(orders, filters);
  }, [orders, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      dateRange: { start: null, end: null },
      statuses: [],
      types: [],
      priceRange: { min: 0, max: 1000 },
      timeRange: { start: '00:00', end: '23:59' }
    });
  };

  const deleteOrder = async (orderId: string) => {
    await BetterAuthStorageService.deleteOrder(orderId);
    await loadOrders();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await BetterAuthStorageService.updateOrderStatus(orderId, status);
    await loadOrders();
  };

  return {
    orders: filteredOrders,
    allOrders: orders,
    filters,
    updateFilters,
    clearFilters,
    deleteOrder,
    updateOrderStatus,
    isLoading,
    refetch: loadOrders
  };
}