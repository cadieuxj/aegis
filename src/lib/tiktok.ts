import { supabaseAdmin } from '@/lib/supabase';

const TIKTOK_AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_API_BASE = 'https://open.tiktokapis.com';
const DEFAULT_TIKTOK_SCOPES = 'user.info.basic,video.publish,video.upload';

interface TikTokTokenData {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in?: number;
  open_id: string;
  scope?: string;
}

interface TikTokUserInfo {
  display_name?: string;
  avatar_url?: string;
  open_id?: string;
}

export interface TikTokCreatorInfo {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

export interface TikTokConnectionRecord {
  id?: string;
  open_id: string;
  access_token: string;
  refresh_token: string;
  scopes: string[];
  expires_at: string;
  refresh_expires_at?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function buildTikTokAuthUrl(state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !redirectUri) {
    throw new Error('TikTok client key or redirect URI not configured');
  }

  const scopes = process.env.TIKTOK_SCOPES || DEFAULT_TIKTOK_SCOPES;
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return `${TIKTOK_AUTH_BASE}?${params.toString()}`;
}

interface TikTokTokenResponse {
  data?: TikTokTokenData;
  message?: string;
  error?: string;
}

function extractTikTokTokenData(payload: TikTokTokenData | TikTokTokenResponse): TikTokTokenData {
  if ('access_token' in payload) {
    return payload;
  }
  if (payload.data) {
    return payload.data;
  }
  throw new Error(payload.error || payload.message || 'TikTok token response missing data');
}

export async function exchangeTikTokCodeForToken(code: string): Promise<TikTokTokenData> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !clientSecret || !redirectUri) {
    throw new Error('TikTok client credentials not configured');
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json() as TikTokTokenData | TikTokTokenResponse;
  if (!response.ok) {
    const message = 'access_token' in payload ? undefined : payload.message;
    throw new Error(message || 'Failed to exchange TikTok authorization code');
  }

  return extractTikTokTokenData(payload);
}

export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenData> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    throw new Error('TikTok client credentials not configured');
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json() as TikTokTokenData | TikTokTokenResponse;
  if (!response.ok) {
    const message = 'access_token' in payload ? undefined : payload.message;
    throw new Error(message || 'Failed to refresh TikTok token');
  }

  return extractTikTokTokenData(payload);
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo | null> {
  const response = await fetch(
    `${TIKTOK_API_BASE}/v2/user/info/?fields=open_id,display_name,avatar_url`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json() as { data?: { user?: TikTokUserInfo } };
  return payload?.data?.user ?? null;
}

export async function upsertTikTokConnection(
  tokenData: TikTokTokenData,
  userInfo?: TikTokUserInfo | null
): Promise<TikTokConnectionRecord> {
  const scopes = (tokenData.scope || '')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  const refreshExpiresAt = tokenData.refresh_expires_in
    ? new Date(Date.now() + tokenData.refresh_expires_in * 1000).toISOString()
    : null;

  const record: TikTokConnectionRecord = {
    open_id: tokenData.open_id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    scopes,
    expires_at: expiresAt,
    refresh_expires_at: refreshExpiresAt,
    display_name: userInfo?.display_name || null,
    avatar_url: userInfo?.avatar_url || null,
  };

  const { error } = await supabaseAdmin
    .from('tiktok_connections')
    .upsert([record], { onConflict: 'open_id' });

  if (error) {
    throw new Error(error.message);
  }

  return record;
}

export async function getTikTokConnection(): Promise<TikTokConnectionRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('tiktok_connections')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}

export async function getValidTikTokAccessToken(): Promise<{
  accessToken: string;
  openId: string;
  connection: TikTokConnectionRecord;
}> {
  const connection = await getTikTokConnection();
  if (!connection) {
    throw new Error('TikTok account not connected');
  }

  const expiresAt = new Date(connection.expires_at).getTime();
  if (Date.now() < expiresAt - 60_000) {
    return { accessToken: connection.access_token, openId: connection.open_id, connection };
  }

  const refreshed = await refreshTikTokToken(connection.refresh_token);
  const updated = await upsertTikTokConnection(refreshed, {
    display_name: connection.display_name || undefined,
    avatar_url: connection.avatar_url || undefined,
    open_id: connection.open_id,
  });

  return { accessToken: updated.access_token, openId: updated.open_id, connection: updated };
}

export async function fetchTikTokCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo | null> {
  const response = await fetch(`${TIKTOK_API_BASE}/v2/post/publish/creator_info/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch TikTok creator info:', response.status);
    return null;
  }

  const payload = (await response.json()) as {
    data?: TikTokCreatorInfo;
    error?: { code: string; message: string };
  };

  if (payload.error) {
    console.error('TikTok creator info error:', payload.error);
    return null;
  }

  return payload.data ?? null;
}
