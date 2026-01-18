import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { buildTikTokAuthUrl } from '@/lib/tiktok';

export async function GET(request: NextRequest) {
  try {
    const state = randomUUID();
    const authUrl = buildTikTokAuthUrl(state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set('tiktok_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start TikTok OAuth';
    const redirectUrl = new URL('/tiktok', request.url);
    redirectUrl.searchParams.set('error', message);
    return NextResponse.redirect(redirectUrl);
  }
}
