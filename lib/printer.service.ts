import { PrinterConfig, PrinterStatus, PrintJob, PrintQueue } from '@/types/printer';
import { render } from 'react-thermal-printer';

class PrinterService {
  private config: PrinterConfig | null = null;
  private port: any | null = null;
  private status: PrinterStatus = { connected: false, ready: false };
  private queue: PrintQueue = { jobs: [], isProcessing: false };
  private statusChangeCallbacks: ((status: PrinterStatus) => void)[] = [];

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('printer-config');
      if (savedConfig) {
        try {
          this.config = JSON.parse(savedConfig);
        } catch (error) {
          console.error('Failed to load printer config:', error);
        }
      }
    }
  }

  setConfig(config: PrinterConfig) {
    this.config = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem('printer-config', JSON.stringify(config));
    }
  }

  getConfig(): PrinterConfig | null {
    return this.config;
  }

  onStatusChange(callback: (status: PrinterStatus) => void) {
    this.statusChangeCallbacks.push(callback);
  }

  private updateStatus(newStatus: Partial<PrinterStatus>) {
    this.status = { ...this.status, ...newStatus };
    this.statusChangeCallbacks.forEach(callback => callback(this.status));
  }

  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Printer configuration not set');
    }

    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported in this browser');
    }

    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({
        baudRate: this.config.baudRate || 9100,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.updateStatus({ connected: true, ready: true });
      return true;
    } catch (error) {
      this.updateStatus({
        connected: false,
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.port && this.port.readable && this.port.writable) {
      try {
        await this.port.close();
      } catch (error) {
        console.error('Error closing printer port:', error);
      }
    }
    this.port = null;
    this.updateStatus({ connected: false, ready: false });
  }

  getStatus(): PrinterStatus {
    return { ...this.status };
  }

  async printReceipt(receiptElement: React.ReactElement, type: 'kitchen-ticket' | 'customer-receipt', orderId: string): Promise<string> {
    if (!this.config) {
      throw new Error('Printer configuration not set');
    }

    try {
      const data = await render(receiptElement as any);

      const printJob: PrintJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        orderId,
        data,
        timestamp: new Date(),
        status: 'pending',
        retryCount: 0
      };

      this.queue.jobs.push(printJob);
      this.processQueue();

      return printJob.id;
    } catch (error) {
      throw new Error(`Failed to render receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.isProcessing || this.queue.jobs.length === 0) {
      return;
    }

    this.queue.isProcessing = true;

    while (this.queue.jobs.length > 0) {
      const job = this.queue.jobs[0];

      if (job.status === 'failed' && job.retryCount >= 3) {
        this.queue.jobs.shift();
        continue;
      }

      try {
        job.status = 'printing';
        await this.sendToPrinter(job.data);
        job.status = 'completed';
        this.queue.jobs.shift();
      } catch (error) {
        job.status = 'failed';
        job.retryCount++;
        this.updateStatus({
          error: error instanceof Error ? error.message : 'Print failed',
          lastError: error instanceof Error ? error.message : 'Print failed'
        });

        if (job.retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          this.queue.jobs.shift();
        }
      }
    }

    this.queue.isProcessing = false;
  }

  private async sendToPrinter(data: Uint8Array): Promise<void> {
    if (!this.port || !this.port.writable) {
      throw new Error('Printer not connected');
    }

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(data);
    } finally {
      writer.releaseLock();
    }
  }

  getQueueStatus(): PrintQueue {
    return {
      jobs: [...this.queue.jobs],
      isProcessing: this.queue.isProcessing
    };
  }

  clearQueue(): void {
    this.queue.jobs = [];
  }
}

export const printerService = new PrinterService();