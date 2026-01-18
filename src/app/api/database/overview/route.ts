import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const TABLES = [
  'research_sources',
  'research_summaries',
  'summary_sources',
  'scripts',
  'audio_assets',
  'visual_assets',
  'posts',
  'engagement_metrics',
  'iteration_recommendations',
  'tiktok_connections',
  'activity_logs',
];

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { success: false, error: 'Supabase environment variables not configured' },
      { status: 500 }
    );
  }

  const results = await Promise.all(
    TABLES.map(async (table) => {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact' })
        .limit(10);

      return {
        table,
        count: count || 0,
        rows: data || [],
        error: error?.message || null,
      };
    })
  );

  return NextResponse.json({
    success: true,
    tables: results,
    timestamp: new Date().toISOString(),
  });
}
