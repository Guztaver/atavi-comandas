export class NotificationService {
  private static audioContext: AudioContext | null = null;

  static async init() {
    // Solicitar permissão de notificação
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Inicializar contexto de áudio
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        ...options
      });

      // Vibrate separadamente
      this.vibrate([200, 100, 200]);

      return notification;
    }
  }

  static playSound(type: 'new' | 'ready' | 'update' = 'new') {
    if (typeof window === 'undefined') return;

    try {
      // Criar som usando Web Audio API
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configurar diferentes sons para diferentes tipos
      switch (type) {
        case 'new':
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.3;
          oscillator.type = 'sine';
          break;
        case 'ready':
          oscillator.frequency.value = 1000;
          gainNode.gain.value = 0.4;
          oscillator.type = 'square';
          break;
        case 'update':
          oscillator.frequency.value = 600;
          gainNode.gain.value = 0.2;
          oscillator.type = 'triangle';
          break;
      }

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback para áudio tradicional
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignorar erros
    }
  }

  static async vibrate(pattern: number | number[] = 200) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  static async notifyNewOrder(orderId: string, customerName?: string) {
    const title = '🆕 Novo Pedido!';
    const message = customerName
      ? `Novo pedido #${orderId.slice(-6)} de ${customerName}`
      : `Novo pedido #${orderId.slice(-6)} recebido`;

    await this.showNotification(title, {
      body: message,
      tag: `order-${orderId}`,
      requireInteraction: true
    });

    this.playSound('new');
    this.vibrate([200, 100, 200]);
  }

  static async notifyOrderReady(orderId: string, customerName?: string) {
    const title = '✅ Pedido Pronto!';
    const message = customerName
      ? `Pedido #${orderId.slice(-6)} de ${customerName} está pronto`
      : `Pedido #${orderId.slice(-6)} está pronto para entrega`;

    await this.showNotification(title, {
      body: message,
      tag: `order-${orderId}`
    });

    this.playSound('ready');
    this.vibrate([300, 100, 300, 100, 300]);
  }

  static async notifyOrderUpdate(orderId: string, status: string) {
    const title = '🔄 Atualização de Pedido';
    const message = `Pedido #${orderId.slice(-6)}: ${this.getStatusText(status)}`;

    await this.showNotification(title, {
      body: message,
      tag: `order-${orderId}`
    });

    this.playSound('update');
    this.vibrate(100);
  }

  private static getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Em preparação';
      case 'ready': return 'Pronto para entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  }
}