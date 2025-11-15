'use client';

import { useState, useEffect, useCallback } from 'react';
import { printerService } from '@/lib/printer.service';
import { PrinterConfig, PrinterStatus, PrintQueue } from '@/types/printer';

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>({ ready: true });
  const [queue, setQueue] = useState<PrintQueue>({ jobs: [], isProcessing: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusChange = (newStatus: PrinterStatus) => {
      setStatus(newStatus);
      if (newStatus.error) {
        setError(newStatus.error);
      }
      // Update loading state based on printing status
      setIsLoading(newStatus.printing || false);
    };

    printerService.onStatusChange(handleStatusChange);

    const interval = setInterval(() => {
      setQueue(printerService.getQueueStatus());
    }, 1000); // Reduced frequency for better performance

    return () => {
      clearInterval(interval);
    };
  }, []);

  const printReceipt = useCallback(async (
    receiptElement: React.ReactElement,
    type: 'kitchen-ticket' | 'customer-receipt',
    orderId: string
  ) => {
    setError(null);
    // Don't set loading here - let the status changes handle it
    try {
      const jobId = await printerService.printReceipt(receiptElement, type, orderId);
      return jobId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print receipt');
      throw err;
    }
    // Don't reset loading - status changes will handle the state
  }, []);

  const setConfig = useCallback((config: PrinterConfig) => {
    printerService.setConfig(config);
  }, []);

  const getConfig = useCallback(() => {
    return printerService.getConfig();
  }, []);

  const clearQueue = useCallback(() => {
    printerService.clearQueue();
  }, []);

  return {
    status,
    queue,
    isLoading,
    error,
    printReceipt,
    setConfig,
    getConfig,
    clearQueue
  };
}