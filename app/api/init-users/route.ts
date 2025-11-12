import { NextResponse } from 'next/server';
import { createDefaultUsers } from '@/lib/auth-config';

export async function POST() {
  try {
    console.log('Initializing default users...');
    await createDefaultUsers();
    console.log('Default users initialized successfully!');

    return NextResponse.json({
      success: true,
      message: 'Default users initialized successfully',
      users: [
        { email: 'admin@atavi.com', password: 'admin123', role: 'admin' },
        { email: 'kitchen@atavi.com', password: 'cozinha123', role: 'kitchen' },
        { email: 'delivery@atavi.com', password: 'delivery123', role: 'delivery' }
      ]
    });
  } catch (error) {
    console.error('Failed to initialize users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}