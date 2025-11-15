import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db, userSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/settings - Get user settings
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

    // For now, use a default user ID since auth is disabled
    const userId = 'default-user';

    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    // Convert array of settings to object
    const settingsObj = settings.reduce((acc: Record<string, any>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Default settings if none exist
    const defaultSettings = {
      sound: true,
      vibration: true,
      desktop: false,
      statisticsPeriod: 'daily',
      ...settingsObj
    };

    return NextResponse.json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Save user settings
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
    const settings = body;

    // For now, use a default user ID since auth is disabled
    const userId = 'default-user';

    // Upsert each setting
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(userSettings)
        .values({
          id: `${userId}-${key}`,
          userId,
          key,
          value: JSON.stringify(value),
          updatedAt: new Date().toISOString()
        })
        .onConflictDoUpdate({
          target: userSettings.id,
          set: {
            value: JSON.stringify(value),
            updatedAt: new Date().toISOString()
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}