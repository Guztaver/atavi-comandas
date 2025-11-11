'use client';

import { useState, useEffect, useCallback } from 'react';
import { printerService } from '@/lib/printer.service';
import { PrinterConfig, PrinterStatus, PrintQueue } from '@/types/printer';

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>({ connected: false, ready: false });
  const [queue, setQueue] = useState<PrintQueue>({ jobs: [], isProcessing: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusChange = (newStatus: PrinterStatus) => {
      setStatus(newStatus);
      if (newStatus.error) {
        setError(newStatus.error);
      }
    };

    printerService.onStatusChange(handleStatusChange);

    const interval = setInterval(() => {
      setQueue(printerService.getQueueStatus());
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await printerService.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to printer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await printerService.disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from printer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const printReceipt = useCallback(async (
    receiptElement: React.ReactElement,
    type: 'kitchen-ticket' | 'customer-receipt',
    orderId: string
  ) => {
    setError(null);
    try {
      const jobId = await printerService.printReceipt(receiptElement, type, orderId);
      return jobId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print receipt');
      throw err;
    }
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
    connect,
    disconnect,
    printReceipt,
    setConfig,
    getConfig,
    clearQueue
  };
}