import { NextResponse } from 'next/server';
import { getValidTikTokAccessToken, fetchTikTokCreatorInfo } from '@/lib/tiktok';

export async function GET() {
  try {
    const { accessToken } = await getValidTikTokAccessToken();
    const creatorInfo = await fetchTikTokCreatorInfo(accessToken);

    if (!creatorInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch creator info' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: creatorInfo });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch creator info';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
