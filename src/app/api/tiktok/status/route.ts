import { NextResponse } from 'next/server';
import { getTikTokConnection } from '@/lib/tiktok';

export async function GET() {
  const configured = Boolean(
    process.env.TIKTOK_CLIENT_KEY &&
      process.env.TIKTOK_CLIENT_SECRET &&
      process.env.TIKTOK_REDIRECT_URI
  );

  if (!configured) {
    return NextResponse.json({
      connected: false,
      configured: false,
    });
  }

  try {
    const connection = await getTikTokConnection();
    if (!connection) {
      return NextResponse.json({
        connected: false,
        configured,
      });
    }

    return NextResponse.json({
      connected: true,
      configured,
      connection: {
        openId: connection.open_id,
        displayName: connection.display_name,
        avatarUrl: connection.avatar_url,
        scopes: connection.scopes,
        expiresAt: connection.expires_at,
        refreshExpiresAt: connection.refresh_expires_at,
        updatedAt: connection.updated_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch TikTok status';
    return NextResponse.json(
      {
        connected: false,
        configured,
        error: message,
      },
      { status: 500 }
    );
  }
}
