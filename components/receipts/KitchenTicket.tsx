'use client';

import React from 'react';
import { Printer, Text, Br, Line, Row, Cut } from 'react-thermal-printer';
import { Order } from '@/types/index';

interface KitchenTicketProps {
  order: Order;
  restaurantName?: string;
}

export function KitchenTicket({ order, restaurantName = "RESTAURANTE" }: KitchenTicketProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const isUrgent = () => {
    const timeSinceCreation = Date.now() - new Date(order.createdAt).getTime();
    const minutesSinceCreation = timeSinceCreation / (1000 * 60);
    return minutesSinceCreation > 15 || order.estimatedTime === 15;
  };

  return (
    <Printer type="epson" width={42}>
      <Text align="center" size={{ width: 2, height: 2 }} bold={true}>
        {restaurantName}
      </Text>
      <Text align="center">COZINHA</Text>
      <Br />

      <Line character="=" />

      <Text size={{ width: 1, height: 1 }} bold={true}>
        {getOrderTypeLabel(order.type)} #{order.id.slice(-6)}
      </Text>

      {order.tableNumber && (
        <Text bold={true}>
          Mesa: {order.tableNumber}
        </Text>
      )}

      {order.customerName && (
        <Text>
          Cliente: {order.customerName}
        </Text>
      )}

      <Text>
        {formatDate(order.createdAt)} {formatTime(order.createdAt)}
      </Text>

      {isUrgent() && (
        <Text invert={true} align="center">
          *** URGENTE ***
        </Text>
      )}

      <Line character="-" />
      <Br />

      <Text bold={true}>ITENS:</Text>
      <Br />

      {order.items.map((item, index) => (
        <div key={item.id}>
          <Text bold={true}>
            {item.quantity}x {item.name}
          </Text>

          {item.notes && (
            <Text>
              Obs: {item.notes}
            </Text>
          )}

          <Text size={{ width: 1, height: 1 }}>
            {item.category === 'food' ? '🍽️' : item.category === 'drink' ? '🥤' : '🍰'}
          </Text>

          {index < order.items.length - 1 && <Br />}
        </div>
      ))}

      <Br />
      <Line character="-" />

      <Row
        left="Total de itens:"
        right={order.items.reduce((sum, item) => sum + item.quantity, 0).toString()}
      />

      <Br />

      {order.estimatedTime && (
        <Text align="center" bold={true}>
          Previsão: {order.estimatedTime} min
        </Text>
      )}

      <Br />
      <Line character="=" />

      <Text align="center" size={{ width: 1, height: 1 }}>
        *** AGUARDANDO PREPARO ***
      </Text>

      <Br />
      <Br />

      <Cut />
    </Printer>
  );
}