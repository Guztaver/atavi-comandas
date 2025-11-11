'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { StorageService } from '@/lib/storage';
import KitchenDeliveryLayout from '@/components/KitchenDeliveryLayout';

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');



  useEffect(() => {
    const loadOrders = () => {
      const allOrders = StorageService.getOrders();
      // Mostrar apenas pedidos que não estão entregues
      const activeOrders = allOrders.filter(order => order.status !== 'delivered');
      setOrders(activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    loadOrders();

    // Atualizar a cada 10 segundos para manter em tempo real
    const interval = setInterval(loadOrders, 10000);
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

      // Se for para "pronto", tentar notificação visual
      if (newStatus === 'ready') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Pedido Pronto!', {
            body: `Pedido #${orderId.slice(-6)} está pronto para retirada`,
            icon: '/icons/icon-192.png'
          });
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
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      default: return status;
    }
  };

  const getTypeText = (type: Order['type']) => {
    switch (type) {
      case 'dine-in': return 'Mesa';
      case 'delivery': return 'Delivery';
      case 'takeout': return 'Viagem';
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
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

  // Solicitar permissão de notificação
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <KitchenDeliveryLayout title="Cozinha" backTo="/dashboard" backLabel="Dashboard">

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
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Nenhum pedido ativo no momento' : `Nenhum pedido com status "${getStatusText(filter)}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {getTypeText(order.type)} • {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-70">
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Informações do Cliente */}
                {(order.customerName || order.tableNumber) && (
                  <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                    {order.customerName && (
                      <p className="text-sm font-medium text-gray-900">
                        Cliente: {order.customerName}
                      </p>
                    )}
                    {order.tableNumber && (
                      <p className="text-sm font-medium text-gray-900">
                        Mesa: {order.tableNumber}
                      </p>
                    )}
                    {order.customerPhone && (
                      <p className="text-sm text-gray-600">
                        {order.customerPhone}
                      </p>
                    )}
                  </div>
                )}

                {/* Itens do Pedido */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Itens:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
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
                      Marcar como Pronto
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Entregue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </KitchenDeliveryLayout>
  );
}