import { Suspense } from 'react';
import { TikTokPanel } from '@/components/dashboard/tiktok-panel';

export default function TikTokPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">TikTok Publishing</h1>
        <p className="text-slate-400 mt-1">
          Connect your creator account and manually publish test posts.
        </p>
      </div>
      <Suspense fallback={<div className="text-sm text-slate-500">Loading TikTok panel...</div>}>
        <TikTokPanel />
      </Suspense>
    </div>
  );
}
