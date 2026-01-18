import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      stats: null,
    });
  }

  try {
    // Fetch all stats in parallel
    const [
      researchResult,
      scriptsResult,
      postsResult,
      publishedPostsResult,
      engagementResult,
      recentPostsResult,
    ] = await Promise.all([
      // Total research sources
      supabase.from('research_sources').select('id', { count: 'exact', head: true }),

      // Total scripts generated
      supabase.from('scripts').select('id', { count: 'exact', head: true }),

      // Total posts
      supabase.from('posts').select('id', { count: 'exact', head: true }),

      // Published posts only
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),

      // Average engagement rate
      supabase.from('engagement_metrics').select('engagement_rate'),

      // Recent posts with their scripts for activity feed
      supabase
        .from('posts')
        .select(`
          id,
          status,
          created_at,
          scripts (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate average engagement rate
    let avgEngagement = 0;
    if (engagementResult.data && engagementResult.data.length > 0) {
      const sum = engagementResult.data.reduce((acc, item) => acc + (item.engagement_rate || 0), 0);
      avgEngagement = sum / engagementResult.data.length;
    }

    // Calculate weekly changes (compare to 7 days ago)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    const [
      prevResearchResult,
      prevScriptsResult,
      prevPostsResult,
    ] = await Promise.all([
      supabase
        .from('research_sources')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', oneWeekAgoStr),
      supabase
        .from('scripts')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', oneWeekAgoStr),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', oneWeekAgoStr),
    ]);

    const researchCount = researchResult.count || 0;
    const scriptsCount = scriptsResult.count || 0;
    const postsCount = postsResult.count || 0;
    const publishedCount = publishedPostsResult.count || 0;

    const prevResearchCount = prevResearchResult.count || 0;
    const prevScriptsCount = prevScriptsResult.count || 0;
    const prevPostsCount = prevPostsResult.count || 0;

    // Calculate percentage changes
    const calcChange = (current: number, previous: number): string => {
      if (previous === 0) {
        return current > 0 ? '+100%' : '0%';
      }
      const change = ((current - previous) / previous) * 100;
      return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
    };

    // Format recent activity
    const recentActivity = (recentPostsResult.data || []).map((post) => {
      const script = Array.isArray(post.scripts) ? post.scripts[0] : post.scripts;
      const createdAt = new Date(post.created_at);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

      let timeAgo: string;
      if (diffHours < 1) {
        timeAgo = 'Just now';
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        timeAgo = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
      }

      return {
        id: post.id,
        title: script?.title || 'Untitled Post',
        time: timeAgo,
        status: post.status,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        researchSources: {
          value: researchCount,
          change: calcChange(researchCount, prevResearchCount),
          trend: researchCount >= prevResearchCount ? 'up' : 'down',
        },
        scriptsGenerated: {
          value: scriptsCount,
          change: calcChange(scriptsCount, prevScriptsCount),
          trend: scriptsCount >= prevScriptsCount ? 'up' : 'down',
        },
        postsPublished: {
          value: publishedCount,
          change: calcChange(postsCount, prevPostsCount),
          trend: postsCount >= prevPostsCount ? 'up' : 'down',
        },
        avgEngagement: {
          value: `${(avgEngagement * 100).toFixed(1)}%`,
          change: '+0%', // Would need historical data to calculate real change
          trend: 'up',
        },
      },
      recentActivity,
      totals: {
        research: researchCount,
        scripts: scriptsCount,
        posts: postsCount,
        published: publishedCount,
      },
    });
  } catch (error) {
    console.error('[Stats API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json(
      { success: false, error: errorMessage, stats: null },
      { status: 500 }
    );
  }
}
