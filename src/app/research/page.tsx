'use client';

import { ResearchFeed } from '@/components/dashboard/research-feed';

export default function ResearchPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Research Feed</h1>
        <p className="text-slate-400 mt-1">
          Browse and select peer-reviewed research for content generation
        </p>
      </div>
      <ResearchFeed />
    </div>
  );
}
