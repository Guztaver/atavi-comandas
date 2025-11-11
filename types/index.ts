export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  category: 'food' | 'drink' | 'dessert';
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  type: 'dine-in' | 'delivery' | 'takeout';
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number;
  tableNumber?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'dessert';
  description?: string;
  isAvailable: boolean;
  preparationTime: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderStatus {
  order: Order;
  kitchenStatus?: 'pending' | 'preparing' | 'ready';
  deliveryStatus?: 'pending' | 'ready' | 'delivering' | 'delivered';
}

export interface AppSettings {
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  statisticsPeriod: 'daily' | 'weekly' | 'monthly';
}

export interface NotificationSettings {
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
}