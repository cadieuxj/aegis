import { NextRequest, NextResponse } from 'next/server';
import { getValidTikTokAccessToken } from '@/lib/tiktok';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com';

export async function POST(request: NextRequest) {
  try {
    const { caption, videoUrl, privacyLevel, disableComment, disableDuet, disableStitch } =
      await request.json();

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    const { accessToken, openId } = await getValidTikTokAccessToken();

    const payload = {
      open_id: openId,
      post_info: {
        title: caption || '',
        privacy_level: privacyLevel || 'PUBLIC_TO_EVERYONE',
        disable_comment: Boolean(disableComment),
        disable_duet: Boolean(disableDuet),
        disable_stitch: Boolean(disableStitch),
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    };

    const response = await fetch(`${TIKTOK_API_BASE}/v2/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || 'TikTok publish failed', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish TikTok video';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
