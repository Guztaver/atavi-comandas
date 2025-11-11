'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { StorageService } from '@/lib/storage';
import { CustomerReceipt } from '@/components/receipts/CustomerReceipt';
import { usePrinter } from '@/hooks/usePrinter';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/hooks/useAuth';

export default function Delivery() {
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'>('all');
  const { printReceipt, status: printerStatus } = usePrinter();

  useEffect(() => {
    const loadOrders = () => {
      const allOrders = StorageService.getOrders();
      // Mostrar apenas pedidos de delivery
      const deliveryOrders = allOrders.filter(order =>
        order.type === 'delivery' || order.type === 'takeout'
      );
      setOrders(deliveryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    loadOrders();

    // Atualizar a cada 15 segundos
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updatedOrder = { ...order, status: newStatus, updatedAt: new Date() };
      StorageService.saveOrder(updatedOrder);

      // Notificar sonoramente
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {}); // Ignorar erro se o arquivo não existir

      // Auto-print customer receipt when order is ready or delivered
      if ((newStatus === 'ready' || newStatus === 'delivered') && printerStatus.connected) {
        try {
          printReceipt(
            <CustomerReceipt order={updatedOrder} />,
            'customer-receipt',
            updatedOrder.id
          ).catch((error) => {
            console.error('Failed to print customer receipt:', error);
          });
        } catch (error) {
          console.error('Error creating customer receipt:', error);
        }
      }

      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'preparing': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'ready': return 'bg-green-100 border-green-300 text-green-800';
      case 'delivered': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status'] | 'delivering') => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto para Entrega';
      case 'delivering': return 'Em Entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const getTypeText = (type: Order['type']) => {
    switch (type) {
      case 'delivery': return 'Delivery';
      case 'takeout': return 'Retirada';
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElapsedTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000 / 60);

    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}min`;
  };

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
      <TopBar 
        title="Delivery" 
        subtitle="Gerencie as entregas e retiradas"
        showPrinterStatus={true}
        showBackButton={true}
        backTo="/dashboard"
        backLabel="Dashboard"
        statistics={[
          {
            label: 'Pendentes',
            value: orders.filter(o => o.status === 'pending').length,
            color: 'text-gray-900'
          },
          {
            label: 'Preparando',
            value: orders.filter(o => o.status === 'preparing').length,
            color: 'text-blue-600'
          },
          {
            label: 'Prontos',
            value: orders.filter(o => o.status === 'ready').length,
            color: 'text-green-600'
          },
          {
            label: 'Entregues',
            value: orders.filter(o => o.status === 'delivered').length,
            color: 'text-gray-600'
          }
        ]}
      >

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pendentes ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'preparing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Preparando ({orders.filter(o => o.status === 'preparing').length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'ready'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Prontos ({orders.filter(o => o.status === 'ready').length})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'delivered'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Entregues ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido de delivery</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'Nenhum pedido de delivery encontrado' : `Nenhum pedido com status "${getStatusText(filter)}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className={`bg-white rounded-lg shadow-md border-2 ${getStatusColor(order.status)}`}>
                <div className="p-6">
                  {/* Cabeçalho do Pedido */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Pedido #{order.id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getTypeText(order.type)} • {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-70">
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="mb-4 p-4 bg-white bg-opacity-50 rounded-lg">
                    {order.customerName && (
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        <strong>Cliente:</strong> {order.customerName}
                      </p>
                    )}
                    {order.customerPhone && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Telefone:</strong> {order.customerPhone}
                      </p>
                    )}
                    {order.customerAddress && order.type === 'delivery' && (
                      <p className="text-sm text-gray-700">
                        <strong>Endereço:</strong> {order.customerAddress}
                      </p>
                    )}
                  </div>

                  {/* Itens do Pedido */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Itens:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Tempo Decorrido */}
                  <div className="mb-4 text-sm text-gray-600">
                    ⏱️ {getElapsedTime(order.createdAt)}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Iniciar Preparo
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Pronto para Entrega
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <>
                        {order.type === 'delivery' && (
                          <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                            🏠 Iniciar Entrega
                          </button>
                        )}
                        {order.type === 'takeout' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Cliente Retirou
                          </button>
                        )}
                      </>
                    )}

                    {order.status === 'delivered' && (
                      <div className="flex-1 text-center py-2 px-4 rounded-lg bg-gray-100 text-gray-600 font-medium">
                        ✅ Entregue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TopBar>
    </div>
  );
}