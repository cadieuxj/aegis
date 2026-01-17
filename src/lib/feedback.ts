import { supabaseAdmin } from './supabase';
import {
  Post,
  EngagementMetrics,
  IterationRecommendation,
  HookType,
  VisualStyle,
} from '@/types';
import { generateId } from './utils';
import { getAlternativeHookType, getAlternativeVisualStyle } from './scripting';

// Performance thresholds
const BOTTOM_PERCENTILE_THRESHOLD = 20;
const TOP_PERCENTILE_THRESHOLD = 80;

interface PerformanceAnalysis {
  percentile: number;
  isLowPerformer: boolean;
  isHighPerformer: boolean;
  primaryWeakness: 'engagement' | 'retention' | 'sharing' | null;
  suggestedChanges: {
    hookType?: HookType;
    visualStyle?: VisualStyle;
    emotionalTone?: 'direct' | 'emotional';
  };
}

export async function analyzePostPerformance(
  post: Post,
  allMetrics: EngagementMetrics[]
): Promise<PerformanceAnalysis> {
  const postMetrics = post.engagementMetrics;

  if (!postMetrics || allMetrics.length === 0) {
    return {
      percentile: 50,
      isLowPerformer: false,
      isHighPerformer: false,
      primaryWeakness: null,
      suggestedChanges: {},
    };
  }

  // Calculate engagement rate percentile
  const sortedByEngagement = [...allMetrics].sort(
    (a, b) => a.engagementRate - b.engagementRate
  );
  const engagementRank = sortedByEngagement.findIndex(
    (m) => m.postId === post.id
  );
  const percentile = (engagementRank / allMetrics.length) * 100;

  const isLowPerformer = percentile < BOTTOM_PERCENTILE_THRESHOLD;
  const isHighPerformer = percentile > TOP_PERCENTILE_THRESHOLD;

  // Determine primary weakness
  let primaryWeakness: 'engagement' | 'retention' | 'sharing' | null = null;
  if (isLowPerformer) {
    if (postMetrics.completionRate < 0.3) {
      primaryWeakness = 'retention';
    } else if (postMetrics.shares < postMetrics.likes * 0.1) {
      primaryWeakness = 'sharing';
    } else {
      primaryWeakness = 'engagement';
    }
  }

  // Generate suggested changes for low performers
  const suggestedChanges: PerformanceAnalysis['suggestedChanges'] = {};

  if (isLowPerformer) {
    // Suggest alternative hook type
    suggestedChanges.hookType = getAlternativeHookType(post.hookType);

    // Suggest alternative visual style based on weakness
    if (primaryWeakness === 'retention') {
      // More engaging visuals
      suggestedChanges.visualStyle = 'holographic_interface';
      suggestedChanges.emotionalTone = 'direct';
    } else if (primaryWeakness === 'sharing') {
      // More emotional, shareable content
      suggestedChanges.visualStyle = 'human_ai_interaction';
      suggestedChanges.emotionalTone = 'emotional';
    } else {
      suggestedChanges.visualStyle = getAlternativeVisualStyle(post.visualStylePrompt);
    }
  }

  return {
    percentile,
    isLowPerformer,
    isHighPerformer,
    primaryWeakness,
    suggestedChanges,
  };
}

export async function generateIterationRecommendation(
  post: Post,
  analysis: PerformanceAnalysis
): Promise<IterationRecommendation> {
  let reasoning = '';

  if (analysis.isLowPerformer) {
    reasoning = `Post performed in the bottom ${analysis.percentile.toFixed(1)}% of content. `;

    switch (analysis.primaryWeakness) {
      case 'retention':
        reasoning +=
          'Low completion rate suggests the hook or early content isn\'t engaging enough. Recommending a more direct approach with attention-grabbing visuals.';
        break;
      case 'sharing':
        reasoning +=
          'Low share-to-like ratio indicates content isn\'t emotionally resonant enough. Recommending more emotional framing with human-centric visuals.';
        break;
      case 'engagement':
        reasoning +=
          'Overall low engagement suggests topic or presentation didn\'t connect. Recommending a different hook style and visual approach.';
        break;
    }
  } else if (analysis.isHighPerformer) {
    reasoning = `Post performed in the top ${(100 - analysis.percentile).toFixed(1)}% of content. Consider replicating this approach for similar topics.`;
  } else {
    reasoning = 'Post performed within average range. No significant changes recommended.';
  }

  return {
    postId: post.id,
    performancePercentile: analysis.percentile,
    suggestedHookType: analysis.suggestedChanges.hookType || post.hookType,
    suggestedVisualStyle: analysis.suggestedChanges.visualStyle || post.visualStylePrompt,
    reasoning,
    createdAt: new Date().toISOString(),
  };
}

export async function getBottomPerformers(limit: number = 10): Promise<Post[]> {
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      engagement_metrics (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !posts) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Sort by engagement rate and get bottom performers
  const sortedPosts = posts
    .filter((p: Record<string, unknown>) => p.engagement_metrics)
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aMetrics = a.engagement_metrics as EngagementMetrics;
      const bMetrics = b.engagement_metrics as EngagementMetrics;
      return (aMetrics?.engagementRate || 0) - (bMetrics?.engagementRate || 0);
    });

  return sortedPosts.slice(0, limit) as unknown as Post[];
}

export async function getTopPerformers(limit: number = 10): Promise<Post[]> {
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      engagement_metrics (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !posts) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Sort by engagement rate and get top performers
  const sortedPosts = posts
    .filter((p: Record<string, unknown>) => p.engagement_metrics)
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aMetrics = a.engagement_metrics as EngagementMetrics;
      const bMetrics = b.engagement_metrics as EngagementMetrics;
      return (bMetrics?.engagementRate || 0) - (aMetrics?.engagementRate || 0);
    });

  return sortedPosts.slice(0, limit) as unknown as Post[];
}

export async function runIterationCycle(): Promise<{
  analyzed: number;
  recommendations: IterationRecommendation[];
}> {
  // Fetch all metrics for comparison
  const { data: allMetricsData } = await supabaseAdmin
    .from('engagement_metrics')
    .select('*');

  const allMetrics = (allMetricsData || []) as EngagementMetrics[];

  // Get bottom performers
  const bottomPerformers = await getBottomPerformers(10);

  const recommendations: IterationRecommendation[] = [];

  for (const post of bottomPerformers) {
    const analysis = await analyzePostPerformance(post, allMetrics);
    const recommendation = await generateIterationRecommendation(post, analysis);
    recommendations.push(recommendation);

    // Store recommendation in database
    await supabaseAdmin.from('iteration_recommendations').insert({
      id: generateId(),
      post_id: post.id,
      performance_percentile: recommendation.performancePercentile,
      suggested_hook_type: recommendation.suggestedHookType,
      suggested_visual_style: recommendation.suggestedVisualStyle,
      reasoning: recommendation.reasoning,
    });
  }

  return {
    analyzed: bottomPerformers.length,
    recommendations,
  };
}

export function calculateEngagementRate(metrics: Partial<EngagementMetrics>): number {
  if (!metrics.views || metrics.views === 0) return 0;

  const interactions =
    (metrics.likes || 0) + (metrics.comments || 0) * 2 + (metrics.shares || 0) * 3;

  return interactions / metrics.views;
}

export async function updateEngagementMetrics(
  postId: string,
  metrics: Partial<EngagementMetrics>
): Promise<void> {
  const engagementRate = calculateEngagementRate(metrics);

  await supabaseAdmin.from('engagement_metrics').upsert({
    post_id: postId,
    views: metrics.views || 0,
    likes: metrics.likes || 0,
    comments: metrics.comments || 0,
    shares: metrics.shares || 0,
    watch_time: metrics.watchTime || 0,
    completion_rate: metrics.completionRate || 0,
    engagement_rate: engagementRate,
    fetched_at: new Date().toISOString(),
  });
}
