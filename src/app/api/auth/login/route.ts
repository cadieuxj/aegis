import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateAuthToken, getAuthCookieConfig } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    const token = generateAuthToken();
    const cookieConfig = getAuthCookieConfig();

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieConfig.name, token, {
      maxAge: cookieConfig.maxAge,
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      path: cookieConfig.path,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
