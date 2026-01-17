import { NextRequest, NextResponse } from 'next/server';
import {
  runIterationCycle,
  getBottomPerformers,
  getTopPerformers,
  updateEngagementMetrics,
} from '@/lib/feedback';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (type === 'bottom') {
      const posts = await getBottomPerformers(limit);
      return NextResponse.json({ success: true, posts, count: posts.length });
    }

    if (type === 'top') {
      const posts = await getTopPerformers(limit);
      return NextResponse.json({ success: true, posts, count: posts.length });
    }

    return NextResponse.json(
      { success: false, error: 'type parameter required (top or bottom)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'runCycle') {
      const result = await runIterationCycle();
      return NextResponse.json({
        success: true,
        analyzed: result.analyzed,
        recommendations: result.recommendations,
      });
    }

    if (action === 'updateMetrics') {
      const { postId, metrics } = body;
      if (!postId || !metrics) {
        return NextResponse.json(
          { success: false, error: 'postId and metrics required' },
          { status: 400 }
        );
      }

      await updateEngagementMetrics(postId, metrics);
      return NextResponse.json({
        success: true,
        message: 'Metrics updated',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback action' },
      { status: 500 }
    );
  }
}
