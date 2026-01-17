'use client';

import { GenerationWizard } from '@/components/dashboard/generation-wizard';

export default function GeneratePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Generate Content</h1>
        <p className="text-slate-400 mt-1">
          Create viral TikTok content from peer-reviewed ethical AI research
        </p>
      </div>
      <GenerationWizard />
    </div>
  );
}
