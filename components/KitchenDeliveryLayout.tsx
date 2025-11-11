'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, ReactNode } from 'react';
import { NotificationService } from '@/lib/notifications';
import { SyncService } from '@/lib/sync';
import BackNavigation from './BackNavigation';

interface KitchenDeliveryLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
  backLabel?: string;
}

export default function KitchenDeliveryLayout({
  children,
  title,
  backTo,
  backLabel
}: KitchenDeliveryLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Inicializar serviços quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Inicializar notificações e sincronização
      NotificationService.init();
      SyncService.setupAutoSync();
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackNavigation
        title={title}
        backTo={backTo}
        backLabel={backLabel}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}