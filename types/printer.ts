export interface PrinterConfig {
  type: 'epson' | 'star';
  width: number;
  characterSet?: string;
}

export interface PrinterStatus {
  ready: boolean;
  error?: string;
  lastError?: string;
}

export interface PrintJob {
  id: string;
  type: 'kitchen-ticket' | 'customer-receipt';
  orderId: string;
  data: Uint8Array;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  retryCount: number;
}

export interface KitchenTicketData {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  orderType: 'dine-in' | 'delivery' | 'takeout';
  tableNumber?: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
    options?: string[];
  }[];
  totalAmount: number;
  timestamp: Date;
  priority?: 'normal' | 'urgent';
}

export interface CustomerReceiptData {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  orderType: 'dine-in' | 'delivery' | 'takeout';
  tableNumber?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  timestamp: Date;
}

export interface PrintQueue {
  jobs: PrintJob[];
  isProcessing: boolean;
}

export type ReceiptType = 'kitchen-ticket' | 'customer-receipt';