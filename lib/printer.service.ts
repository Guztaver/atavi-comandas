import { PrinterConfig, PrinterStatus, PrintJob, PrintQueue } from '@/types/printer';
import { render } from 'react-thermal-printer';
import React from 'react';

class PrinterService {
  private config: PrinterConfig | null = null;
  private status: PrinterStatus = { ready: true };
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

  getStatus(): PrinterStatus {
    return { ...this.status };
  }

  async printReceipt(receiptElement: React.ReactElement, type: 'kitchen-ticket' | 'customer-receipt', orderId: string): Promise<string> {
    if (!this.config) {
      throw new Error('Printer configuration not set');
    }

    try {
      const printJob: PrintJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        orderId,
        data: new Uint8Array(), // Not used with native printing
        timestamp: new Date(),
        status: 'pending',
        retryCount: 0
      };

      this.queue.jobs.push(printJob);
      this.processQueue(receiptElement);

      return printJob.id;
    } catch (error) {
      throw new Error(`Failed to create print job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processQueue(receiptElement?: React.ReactElement): Promise<void> {
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

        if (receiptElement) {
          await this.printWithNativeBrowser(receiptElement);
        }

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

  private async printWithNativeBrowser(receiptElement: React.ReactElement): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create a hidden container for the receipt
        const printContainer = document.createElement('div');
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-9999px';
        printContainer.style.top = '-9999px';
        printContainer.style.width = '300px'; // Typical thermal printer width
        printContainer.style.fontFamily = 'monospace';
        printContainer.style.fontSize = '12px';
        printContainer.style.lineHeight = '1.2';
        printContainer.style.whiteSpace = 'pre';
        printContainer.style.background = 'white';
        printContainer.style.color = 'black';
        printContainer.style.padding = '10px';

        // Render the thermal printer content to HTML
        const htmlContent = this.convertThermalToHTML(receiptElement);
        printContainer.innerHTML = htmlContent;

        document.body.appendChild(printContainer);

        // Use native browser print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print Receipt</title>
                <style>
                  body {
                    font-family: monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 10px;
                    width: 300px;
                    background: white;
                    color: black;
                  }
                  .center { text-align: center; }
                  .bold { font-weight: bold; }
                  .double-size { font-size: 1.5em; }
                  .line { border-bottom: 1px solid black; margin: 5px 0; }
                  .section { margin: 10px 0; }
                </style>
              </head>
              <body>
                ${htmlContent}
              </body>
            </html>
          `);

          printWindow.document.close();
          printWindow.focus();

          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
              document.body.removeChild(printContainer);
              resolve();
            }, 500);
          };

          printWindow.onafterprint = () => {
            printWindow.close();
            if (document.body.contains(printContainer)) {
              document.body.removeChild(printContainer);
            }
            resolve();
          };
        } else {
          // Fallback if popup blocked
          window.print();
          document.body.removeChild(printContainer);
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private convertThermalToHTML(receiptElement: React.ReactElement): string {
    try {
      // Use react-thermal-printer's render function to get the formatted output
      const data = render(receiptElement as any);

      // Convert the thermal printer output to HTML
      // This is a simplified approach - you might need to enhance this
      // based on your specific receipt formatting needs

      // For now, we'll create a print-friendly version that extracts
      // the key information from the receipt elements

      return this.extractContentFromReceipt(receiptElement);
    } catch (error) {
      console.error('Failed to convert receipt to HTML:', error);
      return '<div>Error rendering receipt</div>';
    }
  }

  private extractContentFromReceipt(receiptElement: React.ReactElement): string {
    // Extract props from the receipt element to build HTML
    const order = (receiptElement as any).props?.order;
    if (!order) {
      return '<div>No order data available</div>';
    }

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const getOrderTypeLabel = (type: string) => {
      switch (type) {
        case 'dine-in':
          return 'MESA';
        case 'delivery':
          return 'DELIVERY';
        case 'takeout':
          return 'VIAGEM';
        default:
          return type.toUpperCase();
      }
    };

    // Build HTML based on receipt type
    const isKitchenTicket = (receiptElement.type as any)?.name === 'KitchenTicket';

    if (isKitchenTicket) {
      return `
        <div class="center double-size bold">RESTAURANTE</div>
        <div class="center">COZINHA</div>
        <div class="line"></div>
        <div class="bold">${getOrderTypeLabel(order.type)} #${order.id?.slice(-6) || 'N/A'}</div>
        ${order.tableNumber ? `<div class="bold">Mesa: ${order.tableNumber}</div>` : ''}
        ${order.customerName ? `<div>Cliente: ${order.customerName}</div>` : ''}
        <div>${formatDate(order.createdAt)} ${formatTime(order.createdAt)}</div>
        <div class="line"></div>
        <div class="bold">ITENS:</div>
        ${order.items?.map((item: any) => `
          <div class="bold">${item.quantity}x ${item.name}</div>
          ${item.notes ? `<div>Obs: ${item.notes}</div>` : ''}
          <div>${item.category === 'food' ? '🍽️' : item.category === 'drink' ? '🥤' : '🍰'}</div>
        `).join('<br>') || ''}
        <div class="line"></div>
        <div>Total de itens: ${order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}</div>
        ${order.estimatedTime ? `<div class="center bold">Previsão: ${order.estimatedTime} min</div>` : ''}
        <div class="line"></div>
        <div class="center bold">*** AGUARDANDO PREPARO ***</div>
      `;
    } else {
      // Customer receipt
      return `
        <div class="center double-size bold">RESTAURANTE</div>
        <div class="center">${formatDate(order.createdAt)}</div>
        <div class="line"></div>
        <div class="bold">${getOrderTypeLabel(order.type)} #${order.id?.slice(-6) || 'N/A'}</div>
        ${order.tableNumber ? `<div>Mesa: ${order.tableNumber}</div>` : ''}
        ${order.customerName ? `<div>Cliente: ${order.customerName}</div>` : ''}
        ${order.customerPhone ? `<div>Tel: ${order.customerPhone}</div>` : ''}
        ${order.customerAddress && order.type === 'delivery' ? `<div>End: ${order.customerAddress}</div>` : ''}
        <div>Horário: ${formatTime(order.createdAt)}</div>
        <div class="line"></div>
        <div class="bold">PRODUTOS:</div>
        ${order.items?.map((item: any) => `
          <div>${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}</div>
          ${item.notes ? `<div style="font-size: 0.9em;">${item.notes}</div>` : ''}
        `).join('<br>') || ''}
        <div class="line"></div>
        <div>SUBTOTAL: ${formatCurrency(order.total)}</div>
        <div style="font-size: 0.9em;">* Valores aproximados *</div>
        <div class="line"></div>
        <div class="bold">TOTAL: ${formatCurrency(order.total)}</div>
        <div class="line"></div>
        <div class="center bold">
          ${order.status === 'ready' ? 'PEDIDO PRONTO!' :
            order.status === 'delivered' ? 'ENTREGUE!' :
            'PREPARANDO...'}
        </div>
        ${order.type === 'delivery' && order.status === 'ready' ? '<div class="center">AGUARDANDO ENTREGADOR</div>' : ''}
        <div class="line"></div>
        <div class="center">Obrigado pela preferência!</div>
      `;
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