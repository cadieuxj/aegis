'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Clock, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MotionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MetricValue {
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface PerformanceMetrics {
  totalViews: MetricValue;
  totalLikes: MetricValue;
  totalComments: MetricValue;
  totalShares: MetricValue;
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  engagement: string;
  hookType: string;
}

interface HookTypePerformance {
  type: string;
  avgEngagement: number;
  count: number;
}

interface VisualStylePerformance {
  style: string;
  avgEngagement: number;
  count?: number;
}

interface Recommendation {
  id: string;
  postId: string;
  percentile: number;
  suggestedHookType: string;
  suggestedVisualStyle: string;
  reasoning: string;
}

interface AnalyticsData {
  performanceMetrics: PerformanceMetrics;
  topPosts: TopPost[];
  hookTypePerformance: HookTypePerformance[];
  visualStylePerformance: VisualStylePerformance[];
  recommendations: Recommendation[];
  rawCounts: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    postsAnalyzed: number;
  };
}

interface AnalyticsResponse {
  success: boolean;
  error?: string;
  data: AnalyticsData | null;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      const result: AnalyticsResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const performanceMetrics = data
    ? [
        { label: 'Total Views', ...data.performanceMetrics.totalViews, icon: Eye },
        { label: 'Total Likes', ...data.performanceMetrics.totalLikes, icon: Heart },
        { label: 'Comments', ...data.performanceMetrics.totalComments, icon: MessageCircle },
        { label: 'Shares', ...data.performanceMetrics.totalShares, icon: Share2 },
      ]
    : [
        { label: 'Total Views', value: '-', change: '-', trend: 'up' as const, icon: Eye },
        { label: 'Total Likes', value: '-', change: '-', trend: 'up' as const, icon: Heart },
        { label: 'Comments', value: '-', change: '-', trend: 'up' as const, icon: MessageCircle },
        { label: 'Shares', value: '-', change: '-', trend: 'up' as const, icon: Share2 },
      ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-400 mt-1">
            Track performance and optimize your content strategy
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card variant="bordered" className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <MotionCard
            key={metric.label}
            variant="default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <metric.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <p className="text-xl font-bold text-slate-100">
                      {loading ? (
                        <span className="inline-block w-12 h-6 bg-slate-700 rounded animate-pulse" />
                      ) : (
                        metric.value
                      )}
                    </p>
                  </div>
                </div>
                {!loading && metric.change !== '-' && (
                  <Badge
                    variant={metric.trend === 'up' ? 'success' : 'danger'}
                    className="text-xs"
                  >
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                )}
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hook Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Hook Type Performance
            </CardTitle>
            <CardDescription>
              Average engagement rate by hook style
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
                    <div className="h-2 w-full bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : data?.hookTypePerformance && data.hookTypePerformance.length > 0 ? (
              <div className="space-y-4">
                {data.hookTypePerformance.map((item, index) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{item.type}</span>
                      <span className="text-sm text-cyan-400">{item.avgEngagement}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={item.avgEngagement}
                        max={10}
                        variant="gradient"
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-500 w-16">
                        {item.count} posts
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No hook performance data yet</p>
                <p className="text-sm text-slate-500">Publish posts to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Style Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Visual Style Performance
            </CardTitle>
            <CardDescription>
              Average engagement rate by visual aesthetic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
                    <div className="h-2 w-full bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : data?.visualStylePerformance && data.visualStylePerformance.length > 0 ? (
              <div className="space-y-4">
                {data.visualStylePerformance.map((item, index) => (
                  <motion.div
                    key={item.style}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{item.style}</span>
                      <span className="text-sm text-cyan-400">{item.avgEngagement}%</span>
                    </div>
                    <Progress
                      value={item.avgEngagement}
                      max={10}
                      variant="gradient"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No visual style data yet</p>
                <p className="text-sm text-slate-500">Generate content to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Top Performing Posts
          </CardTitle>
          <CardDescription>
            Your best content this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30">
                  <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.topPosts && data.topPosts.length > 0 ? (
            <div className="space-y-4">
              {data.topPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 truncate">{post.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()} views
                      </span>
                      <span className="text-xs text-slate-500">
                        {post.hookType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success">{post.engagement}% engagement</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No posts with metrics yet</p>
              <p className="text-sm text-slate-500">Publish content and gather engagement data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Iteration Recommendations */}
      <Card variant="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Iteration Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered suggestions based on performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <div className="h-4 w-1/3 bg-slate-700 rounded animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : data?.recommendations && data.recommendations.length > 0 ? (
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-lg ${
                    rec.percentile < 20
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-emerald-500/10 border border-emerald-500/30'
                  }`}
                >
                  <h4 className={`font-medium mb-2 ${rec.percentile < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Post at {rec.percentile}th percentile
                  </h4>
                  <p className="text-sm text-slate-400 mb-2">
                    {rec.reasoning}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {rec.suggestedHookType && (
                      <Badge variant="outline">Hook: {rec.suggestedHookType}</Badge>
                    )}
                    {rec.suggestedVisualStyle && (
                      <Badge variant="outline">Style: {rec.suggestedVisualStyle}</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
              >
                <h4 className="font-medium text-cyan-400 mb-2">
                  Getting Started
                </h4>
                <p className="text-sm text-slate-400 mb-3">
                  Recommendations will appear once you have enough published posts with engagement data. The algorithm analyzes:
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Hook type effectiveness across different topics
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Visual style impact on viewer retention
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Bottom 20% performers for targeted improvements
                  </li>
                </ul>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
