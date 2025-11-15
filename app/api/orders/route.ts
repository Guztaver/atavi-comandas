import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db, orders, orderItems, menuItems } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable authentication after debugging
    // Verify authentication using Better Auth
    // const session = await auth.api.getSession({
    //   headers: request.headers,
    // });

    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with filters
    const queryBuilder = db.select({
      id: orders.id,
      customerName: orders.customerName,
      customerAddress: orders.customerAddress,
      customerPhone: orders.customerPhone,
      type: orders.type,
      tableNumber: orders.tableNumber,
      total: orders.total,
      status: orders.status,
      estimatedTime: orders.estimatedTime,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    }).from(orders);

    // Add status filter if provided
    const finalQuery = status
      ? queryBuilder.where(eq(orders.status, status as 'pending' | 'preparing' | 'ready' | 'delivered'))
      : queryBuilder;

    // Execute query
    const ordersData = await finalQuery
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            notes: orderItems.notes,
            name: menuItems.name,
            category: menuItems.category,
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            name: item.name,
            category: item.category,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable authentication after debugging
    // Verify authentication using Better Auth
    // const session = await auth.api.getSession({
    //   headers: request.headers,
    // });

    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const {
      customerName,
      customerAddress,
      customerPhone,
      type = 'dine-in',
      tableNumber,
      items,
      estimatedTime,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Validate each item has required structure
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: 'Each item must have a valid quantity' },
          { status: 400 }
        );
      }
      
      if (!item.menuItemId && !item.id) {
        return NextResponse.json(
          { success: false, message: 'Each item must have an ID' },
          { status: 400 }
        );
      }
    }

    // Calculate total
    let total = 0;
    const orderItemsWithPrices = [];

    for (const item of items) {
      // Support both 'id' and 'menuItemId' for backward compatibility
      const menuItemId = item.menuItemId || item.id;
      
      if (!menuItemId) {
        return NextResponse.json(
          { success: false, message: 'Menu item ID is required' },
          { status: 400 }
        );
      }

      const menuItem = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, menuItemId))
        .limit(1);

      if (menuItem.length === 0) {
        return NextResponse.json(
          { success: false, message: `Menu item ${menuItemId} not found` },
          { status: 400 }
        );
      }

      const itemTotal = menuItem[0].price * item.quantity;
      total += itemTotal;

      orderItemsWithPrices.push({
        id: `order-item-${Date.now()}-${Math.random()}`,
        menuItemId: menuItemId,
        quantity: item.quantity,
        price: menuItem[0].price,
        notes: item.notes || null,
      });
    }

    // Generate order ID
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Create order
    await db.insert(orders).values({
      id: orderId,
      customerName: customerName || null,
      customerAddress: customerAddress || null,
      customerPhone: customerPhone || null,
      type,
      tableNumber: tableNumber || null,
      total,
      status: 'pending',
      estimatedTime: estimatedTime || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    // Create order items
    await db.insert(orderItems).values(
      orderItemsWithPrices.map(item => ({
        ...item,
        orderId,
        createdAt: new Date().toISOString(),
      }))
    );

    // Fetch complete order with items
    const completeOrder = await db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        customerAddress: orders.customerAddress,
        customerPhone: orders.customerPhone,
        type: orders.type,
        tableNumber: orders.tableNumber,
        total: orders.total,
        status: orders.status,
        estimatedTime: orders.estimatedTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const orderItemsData = await db
      .select({
        id: orderItems.id,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        notes: orderItems.notes,
        name: menuItems.name,
        category: menuItems.category,
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));

    return NextResponse.json({
      success: true,
      data: {
        ...completeOrder[0],
        items: orderItemsData.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          name: item.name,
          category: item.category,
        })),
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}