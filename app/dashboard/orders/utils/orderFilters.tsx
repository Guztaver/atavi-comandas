import React from 'react';
import { Order } from '@/types';
import { SearchFilters } from '@/types/orders';

export class OrderFilters {
  static filterOrders(orders: Order[], filters: SearchFilters): Order[] {
    return orders.filter(order => {
      // Text search (order ID, customer name, phone)
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const orderId = order.id.toLowerCase();
        const customerName = (order.customerName || '').toLowerCase();
        const customerPhone = (order.customerPhone || '').toLowerCase();
        
        if (!orderId.includes(query) && 
            !customerName.includes(query) && 
            !customerPhone.includes(query)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const orderDate = new Date(order.createdAt);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && orderDate < startDate) return false;
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
          if (orderDate > endDate) return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(order.status)) {
        return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(order.type)) {
        return false;
      }

      // Price range filter
      if (order.total < filters.priceRange.min || order.total > filters.priceRange.max) {
        return false;
      }

      // Time range filter
      if (filters.timeRange.start !== '00:00' || filters.timeRange.end !== '23:59') {
        const orderTime = new Date(order.createdAt);
        const orderHour = orderTime.getHours();
        const orderMinute = orderTime.getMinutes();
        const orderTimeInMinutes = orderHour * 60 + orderMinute;
        
        const [startHour, startMinute] = filters.timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = filters.timeRange.end.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        if (orderTimeInMinutes < startTimeInMinutes || orderTimeInMinutes > endTimeInMinutes) {
          return false;
        }
      }

      return true;
    });
  }

  static getQuickFilters() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return [
      {
        label: 'Hoje',
        filters: {
          dateRange: { 
            start: new Date(today.setHours(0, 0, 0, 0)), 
            end: new Date(today.setHours(23, 59, 59, 999)) 
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        label: 'Ontem',
        filters: {
          dateRange: { 
            start: new Date(yesterday.setHours(0, 0, 0, 0)), 
            end: new Date(yesterday.setHours(23, 59, 59, 999)) 
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        label: 'Últimos 7 dias',
        filters: {
          dateRange: { 
            start: lastWeek, 
            end: new Date(today.setHours(23, 59, 59, 999)) 
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        label: 'Este Mês',
        filters: {
          dateRange: { 
            start: new Date(today.getFullYear(), today.getMonth(), 1), 
            end: new Date(today.setHours(23, 59, 59, 999)) 
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        label: 'Pendentes',
        filters: {
          statuses: ['pending' as const, 'preparing' as const, 'ready' as const]
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        label: 'Delivery',
        filters: {
          types: ['delivery' as const]
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      },
      {
        label: 'Mesa',
        filters: {
          types: ['dine-in' as const]
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      }
    ];
  }

  static calculateStats(orders: Order[]) {
    const total = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = total > 0 ? revenue / total : 0;

    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);

    const typeDistribution = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<Order['type'], number>);

    return {
      total,
      revenue,
      averageOrderValue,
      orderCount: total,
      statusDistribution,
      typeDistribution
    };
  }
}

export const orderFilters = new OrderFilters();