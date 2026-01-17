'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostEditor } from '@/components/editor/post-editor';

function EditorContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId') || undefined;

  return <PostEditor postId={postId} />;
}

export default function EditorPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Post Editor</h1>
        <p className="text-slate-400 mt-1">
          Edit scripts, preview audio, and arrange visual assets
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <EditorContent />
      </Suspense>
    </div>
  );
}
