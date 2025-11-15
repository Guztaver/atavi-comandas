import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db, orders, orderItems, menuItems } from '@/lib/db';
import { eq } from 'drizzle-orm';


// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get order
    const [order] = await db
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
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items
    const itemsData = await db
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
      .where(eq(orderItems.orderId, id));

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: itemsData.map(item => ({
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
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { status, customerName, customerAddress, customerPhone, tableNumber, estimatedTime } = body;

    // Check if order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;

    // Update order
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // Get updated order items
    const itemsData = await db
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
      .where(eq(orderItems.orderId, id));

    return NextResponse.json({
      success: true,
      data: {
        ...updatedOrder,
        items: itemsData.map(item => ({
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
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete order items first (foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, id));

    // Delete order
    await db.delete(orders).where(eq(orders.id, id));

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}