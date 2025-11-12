import { createAuthClient } from 'better-auth/react';
import { Order, MenuItem, AppSettings } from '@/types';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
});

// Enhanced storage service that works with Better Auth
export class BetterAuthStorageService {
  private static readonly API_BASE = '/api';

  // Helper method for API calls with Better Auth authentication
  private static async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        credentials: 'include', // Include cookies for Better Auth session management
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || `HTTP error! status: ${response.status}` };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return { success: false, message: 'Network error' };
    }
  }

  // Orders
  static async getOrders(status?: string): Promise<Order[]> {
    const queryParams = status ? `?status=${status}` : '';
    const result = await this.apiRequest<Order[]>(`/orders${queryParams}`);
    return result.success ? result.data || [] : [];
  }

  static async createOrder(orderData: Partial<Order>): Promise<Order | null> {
    const result = await this.apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return result.success ? result.data || null : null;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const result = await this.apiRequest<Order>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result.success ? result.data || null : null;
  }

  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
    const result = await this.apiRequest<Order>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return result.success ? result.data || null : null;
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    const result = await this.apiRequest<Order>(`/orders/${orderId}`);
    return result.success ? result.data || null : null;
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    const result = await this.apiRequest(`/orders/${orderId}`, {
      method: 'DELETE',
    });
    return result.success;
  }

  static async saveOrder(orderData: Partial<Order>): Promise<Order | null> {
    return this.createOrder(orderData);
  }

  // Menu Items
  static async getMenuItems(category?: string, available?: boolean): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (available !== undefined) params.append('available', available.toString());

    const queryParams = params.toString();
    const result = await this.apiRequest<MenuItem[]>(`/menu${queryParams ? `?${queryParams}` : ''}`);
    return result.success ? result.data || [] : [];
  }

  static async createMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem | null> {
    const result = await this.apiRequest<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return result.success ? result.data || null : null;
  }

  static async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const result = await this.apiRequest<MenuItem>(`/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return result.success ? result.data || null : null;
  }

  static async getMenuItem(itemId: string): Promise<MenuItem | null> {
    const result = await this.apiRequest<MenuItem>(`/menu/${itemId}`);
    return result.success ? result.data || null : null;
  }

  static async deleteMenuItem(itemId: string): Promise<boolean> {
    const result = await this.apiRequest(`/menu/${itemId}`, {
      method: 'DELETE',
    });
    return result.success;
  }

  static async saveMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem | null> {
    if (itemData.id) {
      // Update existing item
      return this.updateMenuItem(itemData.id, itemData);
    } else {
      // Create new item
      return this.createMenuItem(itemData);
    }
  }

  // Authentication (using Better Auth client)
  static async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.data) {
        return { success: true };
      }

      return { success: false, error: result.error?.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const session = await authClient.getSession();
      return session.data?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async verifyAuth() {
    try {
      const session = await authClient.getSession();
      return session.data?.user || null;
    } catch (error) {
      console.error('Error verifying auth:', error);
      return null;
    }
  }

  // Settings - Keep in localStorage as they're client preferences
  private static readonly SETTINGS_KEY = 'atavi-settings';

  static getSettings(): AppSettings {
    if (typeof window === 'undefined') return {
      sound: true,
      vibration: true,
      desktop: false,
      statisticsPeriod: 'daily'
    };

    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      const defaultSettings = {
        sound: true,
        vibration: true,
        desktop: false,
        statisticsPeriod: 'daily' as const
      };
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return {
        sound: true,
        vibration: true,
        desktop: false,
        statisticsPeriod: 'daily'
      };
    }
  }

  static saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getStatisticsPeriod(): 'daily' | 'weekly' | 'monthly' {
    const settings = this.getSettings();
    return settings.statisticsPeriod || 'daily';
  }

  static saveStatisticsPeriod(period: 'daily' | 'weekly' | 'monthly'): void {
    const currentSettings = this.getSettings();
    this.saveSettings({ ...currentSettings, statisticsPeriod: period });
  }

  // Utility method to check if backend is available
  static async isBackendAvailable(): Promise<boolean> {
    try {
      const result = await this.apiRequest('/auth/verify');
      // If we get any response (even 401), the backend is available
      return true;
    } catch {
      return false;
    }
  }
}

export default BetterAuthStorageService;