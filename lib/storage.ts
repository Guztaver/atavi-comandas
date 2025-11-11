import { Order, MenuItem, AppSettings } from '@/types';

const STORAGE_KEYS = {
  ORDERS: 'atavi-orders',
  MENU_ITEMS: 'atavi-menu-items',
  USER: 'atavi-user',
  SETTINGS: 'atavi-settings'
} as const;

export class StorageService {
  // Orders
  static getOrders(): Order[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  static saveOrder(order: Order): void {
    if (typeof window === 'undefined') return;
    const orders = this.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static deleteOrder(orderId: string): void {
    if (typeof window === 'undefined') return;
    const orders = this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders));
  }

  // Menu Items
  static getMenuItems(): MenuItem[] {
    if (typeof window === 'undefined') return this.getDefaultMenuItems();
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return data ? JSON.parse(data) : this.getDefaultMenuItems();
  }

  static saveMenuItem(item: MenuItem): void {
    if (typeof window === 'undefined') return;
    const items = this.getMenuItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  }

  private static getDefaultMenuItems(): MenuItem[] {
    return [
      // Pratos principais
      { id: '1', name: 'Hambúrguer Tradicional', price: 25.00, category: 'food', description: 'Pão, carne, queijo, alface, tomate', isAvailable: true, preparationTime: 15 },
      { id: '2', name: 'Hambúrguer Bacon', price: 32.00, category: 'food', description: 'Pão, carne, queijo, bacon, alface, tomate', isAvailable: true, preparationTime: 18 },
      { id: '3', name: 'Hambúrguer Vegano', price: 28.00, category: 'food', description: 'Pão, hambúrguer vegetal, queijo vegano, alface', isAvailable: true, preparationTime: 15 },
      { id: '4', name: 'Batata Frita', price: 12.00, category: 'food', description: 'Porção de batata frita crocante', isAvailable: true, preparationTime: 10 },
      { id: '5', name: 'Onion Rings', price: 15.00, category: 'food', description: 'Anéis de cebola empanados', isAvailable: true, preparationTime: 12 },

      // Bebidas
      { id: '6', name: 'Refrigerante Lata', price: 6.00, category: 'drink', description: 'Coca-Cola, Guaraná, Fanta', isAvailable: true, preparationTime: 2 },
      { id: '7', name: 'Suco Natural', price: 8.00, category: 'drink', description: 'Laranja, Limão, Maracujá', isAvailable: true, preparationTime: 5 },
      { id: '8', name: 'Água Mineral', price: 4.00, category: 'drink', description: 'Com ou sem gás', isAvailable: true, preparationTime: 1 },
      { id: '9', name: 'Cerveja', price: 10.00, category: 'drink', description: 'Long neck 350ml', isAvailable: true, preparationTime: 2 },

      // Sobremesas
      { id: '10', name: 'Brownie', price: 12.00, category: 'dessert', description: 'Brownie com sorvete', isAvailable: true, preparationTime: 8 },
      { id: '11', name: 'Milk Shake', price: 15.00, category: 'dessert', description: 'Chocolate, Morango ou Ovomaltine', isAvailable: true, preparationTime: 6 },
      { id: '12', name: 'Petit Gateau', price: 18.00, category: 'dessert', description: 'Bolho de chocolate quente', isAvailable: true, preparationTime: 10 }
    ];
  }

  // User Authentication
  static getUser(): { username: string } | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  static saveUser(username: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ username }));
  }

  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Settings
  static getSettings(): AppSettings {
    if (typeof window === 'undefined') return {
      sound: true,
      vibration: true,
      desktop: false,
      statisticsPeriod: 'daily'
    };
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings = {
      sound: true,
      vibration: true,
      desktop: false,
      statisticsPeriod: 'daily' as const
    };
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  }

  static saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Statistics Period Management
  static getStatisticsPeriod(): 'daily' | 'weekly' | 'monthly' {
    const settings = this.getSettings();
    return settings.statisticsPeriod || 'daily';
  }

  static saveStatisticsPeriod(period: 'daily' | 'weekly' | 'monthly'): void {
    const currentSettings = this.getSettings();
    this.saveSettings({ ...currentSettings, statisticsPeriod: period });
  }
}