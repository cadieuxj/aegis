import { NextRequest, NextResponse } from 'next/server';
import { exchangeTikTokCodeForToken, fetchTikTokUserInfo, upsertTikTokConnection } from '@/lib/tiktok';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') || searchParams.get('error_description');

  const redirectUrl = new URL('/tiktok', request.url);

  if (error) {
    redirectUrl.searchParams.set('error', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    redirectUrl.searchParams.set('error', 'Missing TikTok OAuth code');
    return NextResponse.redirect(redirectUrl);
  }

  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    redirectUrl.searchParams.set('error', 'Invalid OAuth state');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokenData = await exchangeTikTokCodeForToken(code);
    const userInfo = await fetchTikTokUserInfo(tokenData.access_token);
    await upsertTikTokConnection(tokenData, userInfo);

    redirectUrl.searchParams.set('connected', 'true');
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('tiktok_oauth_state', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to complete TikTok OAuth';
    redirectUrl.searchParams.set('error', message);
    return NextResponse.redirect(redirectUrl);
  }
}
