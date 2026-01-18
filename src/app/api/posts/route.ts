import { NextRequest, NextResponse } from 'next/server';
import { listPosts, loadPost, updatePostContent, updatePostStatus } from '@/lib/engine';
import type { PostStatus } from '@/types';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'draft' | 'approved' | 'published' | 'archived' | null;
    const postId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (postId) {
      const post = await loadPost(postId);
      if (!post) {
        await logActivity({
          eventType: 'post.load_failed',
          entityType: 'post',
          entityId: postId,
          status: 'error',
          message: 'Post not found',
        });
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }
      await logActivity({
        eventType: 'post.loaded',
        entityType: 'post',
        entityId: postId,
      });
      return NextResponse.json({ success: true, post });
    }

    const posts = await listPosts(status || undefined, limit);
    await logActivity({
      eventType: 'post.listed',
      entityType: 'post',
      metadata: {
        status: status || 'all',
        count: posts.length,
      },
    });

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('Posts API error:', error);
    await logActivity({
      eventType: 'post.listed',
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
    const postId = typeof body?.postId === 'string' ? body.postId : null;
    const status = body?.status as PostStatus | undefined;
    const script = body?.script as
      | { id?: string; sections?: unknown; fullText?: string }
      | undefined;
    const visuals = body?.visuals as Array<{ id: string; sequence: number }> | undefined;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId required' },
        { status: 400 }
      );
    }

    if (!status && !script && !visuals) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    if (status) {
      await updatePostStatus(postId, status);
    }

    if (script || visuals) {
      await updatePostContent({
        postId,
        scriptId: script?.id,
        sections: script?.sections,
        fullText: script?.fullText,
        visuals,
      });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Post status updated to ${status}` : 'Post updated',
    });
  } catch (error) {
    console.error('Posts API error:', error);
    await logActivity({
      eventType: 'post.updated',
      entityType: 'post',
      entityId: typeof body?.postId === 'string' ? body.postId : null,
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to update post',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
