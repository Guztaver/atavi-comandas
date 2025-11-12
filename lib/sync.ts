import { Order } from '@/types';
import { BetterAuthStorageService } from './better-auth-storage';

export class SyncService {
  private static readonly SYNC_QUEUE_KEY = 'atavi-sync-queue';
  private static readonly LAST_SYNC_KEY = 'atavi-last-sync';
  private static syncInProgress = false;

  static isOnline(): boolean {
    return typeof window !== 'undefined' && navigator.onLine;
  }

  static getLastSyncTime(): Date | null {
    if (typeof window === 'undefined') return null;
    const timestamp = localStorage.getItem(this.LAST_SYNC_KEY);
    return timestamp ? new Date(timestamp) : null;
  }

  static updateLastSyncTime(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
  }

  static getSyncQueue(): any[] {
    if (typeof window === 'undefined') return [];
    const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  static addToSyncQueue(action: any): void {
    if (typeof window === 'undefined') return;
    const queue = this.getSyncQueue();
    queue.push({
      ...action,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static clearSyncQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  static async syncWithServer(): Promise<boolean> {
    if (!this.isOnline() || this.syncInProgress) {
      return false;
    }

    this.syncInProgress = true;

    try {
      // Em um ambiente real, aqui você faria a sincronização com seu servidor
      // Por enquanto, vamos apenas limpar a fila e atualizar o timestamp

      const queue = this.getSyncQueue();

      // Simular sincronização (em produção, seria uma chamada API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Processar cada item da fila
      for (const item of queue) {
        console.log('Sincronizando:', item);
        // Aqui você enviaria os dados para o servidor
      }

      // Limpar fila após sincronização bem-sucedida
      this.clearSyncQueue();
      this.updateLastSyncTime();

      console.log('Sincronização concluída com sucesso');
      return true;

    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  static async saveOrderWithSync(order: Order): Promise<void> {
    // Salvar usando Better Auth Storage Service (que já usa a API)
    try {
      await BetterAuthStorageService.createOrder(order);
      console.log('Order saved to SQLite database:', order.id);
    } catch (error) {
      console.error('Failed to save order:', error);

      // Adicionar à fila de sincronização como fallback
      this.addToSyncQueue({
        type: 'saveOrder',
        data: order
      });

      // Tentar sincronizar se estiver online
      if (this.isOnline()) {
        this.syncWithServer();
      }
    }
  }

  static async setupAutoSync(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Sincronizar quando voltar online
    const handleOnline = () => {
      console.log('Voltou online, iniciando sincronização...');
      this.syncWithServer();
    };

    // Tentar sincronizar periodicamente
    const periodicSync = () => {
      if (this.isOnline() && !this.syncInProgress) {
        const lastSync = this.getLastSyncTime();
        const now = new Date();

        // Sincronizar se a última sincronização foi há mais de 5 minutos
        if (!lastSync || (now.getTime() - lastSync.getTime()) > 5 * 60 * 1000) {
          this.syncWithServer();
        }
      }
    };

    // Configurar listeners
    window.addEventListener('online', handleOnline);

    // Sincronização periódica a cada 2 minutos
    setInterval(periodicSync, 2 * 60 * 1000);

    // Sincronização imediata se estiver online
    if (this.isOnline()) {
      setTimeout(() => this.syncWithServer(), 2000);
    }
  }

  static getSyncStatus(): {
    isOnline: boolean;
    lastSync: Date | null;
    pendingSyncs: number;
    syncInProgress: boolean;
  } {
    return {
      isOnline: this.isOnline(),
      lastSync: this.getLastSyncTime(),
      pendingSyncs: this.getSyncQueue().length,
      syncInProgress: this.syncInProgress
    };
  }

  // Simular endpoints de API (em produção seriam chamadas reais)
  static async fetchOrdersFromServer(): Promise<Order[]> {
    // Usar Better Auth Storage Service para buscar pedidos do banco de dados
    try {
      return await BetterAuthStorageService.getOrders();
    } catch (error) {
      console.error('Failed to fetch orders from server:', error);
      return [];
    }
  }

  static async pushOrdersToServer(orders: Order[]): Promise<boolean> {
    // Simular envio de pedidos para o servidor
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular sucesso 90% das vezes
    return Math.random() > 0.1;
  }
}