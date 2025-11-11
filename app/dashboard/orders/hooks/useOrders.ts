'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/types';
import { StorageService } from '@/lib/storage';
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

  const loadOrders = () => {
    setIsLoading(true);
    try {
      const allOrders = StorageService.getOrders();
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

  const deleteOrder = (orderId: string) => {
    StorageService.deleteOrder(orderId);
    loadOrders();
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const orders = StorageService.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date()
      };
      localStorage.setItem('atavi-orders', JSON.stringify(orders));
      loadOrders();
    }
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