import { NextRequest, NextResponse } from 'next/server';
import { getValidTikTokAccessToken } from '@/lib/tiktok';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      caption,
      videoUrl,
      privacyLevel,
      // Support both old disable* flags and new enable* flags
      disableComment,
      disableDuet,
      disableStitch,
      enableComment,
      enableDuet,
      enableStitch,
    } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    if (!privacyLevel || typeof privacyLevel !== 'string') {
      return NextResponse.json(
        { success: false, error: 'privacyLevel is required' },
        { status: 400 }
      );
    }

    const { accessToken, openId } = await getValidTikTokAccessToken();

    // Handle both old disable flags and new enable flags
    // If enable flags are provided, invert them to get disable flags
    // Otherwise fall back to the old disable flags
    const computeDisableComment =
      enableComment !== undefined ? !enableComment : Boolean(disableComment);
    const computeDisableDuet =
      enableDuet !== undefined ? !enableDuet : Boolean(disableDuet);
    const computeDisableStitch =
      enableStitch !== undefined ? !enableStitch : Boolean(disableStitch);

    const payload = {
      post_info: {
        title: caption || '',
        privacy_level: privacyLevel,
        disable_comment: computeDisableComment,
        disable_duet: computeDisableDuet,
        disable_stitch: computeDisableStitch,
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
