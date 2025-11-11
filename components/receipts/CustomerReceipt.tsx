'use client';

import React from 'react';
import { Printer, Text, Br, Line, Row, Cut } from 'react-thermal-printer';
import { Order } from '@/types/index';

interface CustomerReceiptProps {
  order: Order;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

export function CustomerReceipt({
  order,
  restaurantName = "RESTAURANTE",
  restaurantAddress,
  restaurantPhone
}: CustomerReceiptProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
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

  return (
    <Printer type="epson" width={42}>
      <Text align="center" size={{ width: 2, height: 2 }} bold={true}>
        {restaurantName}
      </Text>

      {restaurantAddress && (
        <Text align="center" size={{ width: 1, height: 1 }}>
          {restaurantAddress}
        </Text>
      )}

      {restaurantPhone && (
        <Text align="center">
          {restaurantPhone}
        </Text>
      )}

      <Text align="center">
        {formatDate(order.createdAt)}
      </Text>

      <Br />
      <Line character="=" />

      <Text bold={true}>
        {getOrderTypeLabel(order.type)} #{order.id.slice(-6)}
      </Text>

      {order.tableNumber && (
        <Text>
          Mesa: {order.tableNumber}
        </Text>
      )}

      {order.customerName && (
        <Text>
          Cliente: {order.customerName}
        </Text>
      )}

      {order.customerPhone && (
        <Text>
          Tel: {order.customerPhone}
        </Text>
      )}

      {order.customerAddress && order.type === 'delivery' && (
        <Text>
          End: {order.customerAddress}
        </Text>
      )}

      <Text>
        Horário: {formatTime(order.createdAt)}
      </Text>

      <Line character="-" />
      <Br />

      <Text bold={true}>PRODUTOS:</Text>
      <Br />

      {order.items.map((item) => (
        <div key={item.id}>
          <Row
            left={`${item.quantity}x ${item.name}`}
            right={formatCurrency(item.price * item.quantity)}
          />

          {item.notes && (
            <Text size={{ width: 1, height: 1 }}>
              {item.notes}
            </Text>
          )}
        </div>
      ))}

      <Br />
      <Line character="-" />

      <Row
        left="SUBTOTAL:"
        right={formatCurrency(order.total)}
      />

      <Text size={{ width: 1, height: 1 }}>
        * Valores aproximados *
      </Text>

      <Br />
      <Line character="=" />

      <Row
        left={<Text bold={true}>TOTAL:</Text>}
        right={<Text bold={true}>{formatCurrency(order.total)}</Text>}
      />

      <Br />

      <Text align="center" bold={true}>
        {order.status === 'ready' ? 'PEDIDO PRONTO!' :
         order.status === 'delivered' ? 'ENTREGUE!' :
         'PREPARANDO...'}
      </Text>

      <Br />

      {order.type === 'delivery' && order.status === 'ready' && (
        <Text align="center" invert={true}>
          AGUARDANDO ENTREGADOR
        </Text>
      )}

      <Br />

      <Text align="center" size={{ width: 1, height: 1 }}>
        Obrigado pela preferência!
      </Text>

      {restaurantPhone && (
        <Text align="center">
          Ligue: {restaurantPhone}
        </Text>
      )}

      <Br />
      <Br />

      <Cut />
    </Printer>
  );
}