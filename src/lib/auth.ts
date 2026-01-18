import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'aegis_auth';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie?.value) {
    return false;
  }

  // Verify the token matches our secret
  const expectedToken = generateAuthToken();
  return authCookie.value === expectedToken;
}

export function generateAuthToken(): string {
  const password = process.env.AEGIS_PASSWORD;
  if (!password) {
    throw new Error('AEGIS_PASSWORD not configured');
  }
  // Simple hash for session token
  return Buffer.from(`aegis:${password}`).toString('base64');
}

export function verifyPassword(inputPassword: string): boolean {
  const correctPassword = process.env.AEGIS_PASSWORD;
  if (!correctPassword) {
    return false;
  }
  return inputPassword === correctPassword;
}

export function getAuthCookieConfig() {
  return {
    name: AUTH_COOKIE_NAME,
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}
