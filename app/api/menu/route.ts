import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db, menuItems } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/menu - Get all menu items
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
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with filters
    const conditions = [];
    if (category) {
      conditions.push(eq(menuItems.category, category as 'food' | 'drink' | 'dessert'));
    }
    if (available !== null) {
      conditions.push(eq(menuItems.isAvailable, available === 'true'));
    }

    // Execute query
    const queryBuilder = db.select().from(menuItems);
    const finalQuery = conditions.length > 0
      ? queryBuilder.where(and(...conditions))
      : queryBuilder;

    const items = await finalQuery
      .orderBy(desc(menuItems.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu item
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
      name,
      description,
      price,
      category,
      preparationTime = 15,
      isAvailable = true,
    } = body;

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // Generate menu item ID
    const menuItemId = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    console.log(`POST: Creating new menu item with ID: ${menuItemId}`);

    // Create menu item
    try {
      const [newItem] = await db.insert(menuItems).values({
        id: menuItemId,
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        preparationTime: parseInt(preparationTime),
        isAvailable: Boolean(isAvailable),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();

      console.log(`POST: Successfully created menu item:`, newItem);

      return NextResponse.json({
        success: true,
        data: newItem
      });
    } catch (dbError) {
      console.error(`POST: Database error creating menu item:`, dbError);
      return NextResponse.json(
        { success: false, message: 'Database error creating menu item' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}