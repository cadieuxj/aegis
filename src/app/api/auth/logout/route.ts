import { NextResponse } from 'next/server';
import { getAuthCookieConfig } from '@/lib/auth';

export async function POST() {
  const cookieConfig = getAuthCookieConfig();

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieConfig.name, '', {
    maxAge: 0,
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    path: cookieConfig.path,
  });

  return response;
}
