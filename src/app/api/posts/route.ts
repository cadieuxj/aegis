import { NextRequest, NextResponse } from 'next/server';
import { listPosts, loadPost, updatePostContent, updatePostStatus } from '@/lib/engine';

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
    const { postId, status, script, visuals } = body;

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
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
