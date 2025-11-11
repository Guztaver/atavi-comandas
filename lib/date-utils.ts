import { Order } from '@/types';

export type StatisticsPeriod = 'daily' | 'weekly' | 'monthly';

export function getDateRange(period: StatisticsPeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  // Set end to end of current day
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case 'daily':
      // Start of current day
      start.setHours(0, 0, 0, 0);
      break;

    case 'weekly':
      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, treat as previous week
      start.setDate(now.getDate() - daysSinceMonday);
      start.setHours(0, 0, 0, 0);
      break;

    case 'monthly':
      // Start of current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    default:
      // Default to daily if invalid period
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

export function filterOrdersByPeriod(orders: Order[], period: StatisticsPeriod): Order[] {
  const { start, end } = getDateRange(period);

  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= start && orderDate <= end;
  });
}

export function getPeriodLabel(period: StatisticsPeriod): string {
  switch (period) {
    case 'daily':
      return 'Hoje';
    case 'weekly':
      return 'Esta Semana';
    case 'monthly':
      return 'Este Mês';
    default:
      return 'Hoje';
  }
}

export function formatPeriodRange(period: StatisticsPeriod): string {
  const { start, end } = getDateRange(period);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };

  switch (period) {
    case 'daily':
      return start.toLocaleDateString('pt-BR', { ...options, year: 'numeric' });

    case 'weekly':
      return `${start.toLocaleDateString('pt-BR', options)} - ${end.toLocaleDateString('pt-BR', { ...options, year: 'numeric' })}`;

    case 'monthly':
      return start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    default:
      return start.toLocaleDateString('pt-BR', options);
  }
}

export function isOrderInPeriod(order: Order, period: StatisticsPeriod): boolean {
  const { start, end } = getDateRange(period);
  const orderDate = new Date(order.createdAt);
  return orderDate >= start && orderDate <= end;
}