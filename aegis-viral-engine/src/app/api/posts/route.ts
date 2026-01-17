import { NextRequest, NextResponse } from 'next/server';
import { listPosts, loadPost, updatePostStatus } from '@/lib/engine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'draft' | 'approved' | 'published' | 'archived' | null;
    const postId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (postId) {
      const post = await loadPost(postId);
      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, post });
    }

    const posts = await listPosts(status || undefined, limit);

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, status } = body;

    if (!postId || !status) {
      return NextResponse.json(
        { success: false, error: 'postId and status required' },
        { status: 400 }
      );
    }

    await updatePostStatus(postId, status);

    return NextResponse.json({
      success: true,
      message: `Post status updated to ${status}`,
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
