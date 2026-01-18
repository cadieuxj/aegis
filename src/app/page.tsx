'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
  BookOpen,
  FileText,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MotionCard } from '@/components/ui/card';
import { MotionButton, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatItem {
  value: number | string;
  change: string;
  trend: 'up' | 'down';
}

interface StatsData {
  researchSources: StatItem;
  scriptsGenerated: StatItem;
  postsPublished: StatItem;
  avgEngagement: StatItem;
}

interface RecentActivity {
  id: string;
  title: string;
  time: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
}

interface StatsResponse {
  success: boolean;
  error?: string;
  stats: StatsData | null;
  recentActivity: RecentActivity[];
}

const quickActions = [
  {
    title: 'Generate Content',
    description: 'Create a new viral post from research',
    icon: Sparkles,
    href: '/generate',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    title: 'Research Feed',
    description: 'Browse latest academic sources',
    icon: BookOpen,
    href: '/research',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Post Editor',
    description: 'Edit and approve pending posts',
    icon: FileText,
    href: '/editor',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    href: '/analytics',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stats');
      const data: StatsResponse = await response.json();

      if (data.success && data.stats) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsDisplay = stats
    ? [
        { label: 'Research Sources', ...stats.researchSources },
        { label: 'Scripts Generated', ...stats.scriptsGenerated },
        { label: 'Posts Published', ...stats.postsPublished },
        { label: 'Avg. Engagement', ...stats.avgEngagement },
      ]
    : [
        { label: 'Research Sources', value: '-', change: '-', trend: 'up' as const },
        { label: 'Scripts Generated', value: '-', change: '-', trend: 'up' as const },
        { label: 'Posts Published', value: '-', change: '-', trend: 'up' as const },
        { label: 'Avg. Engagement', value: '-', change: '-', trend: 'up' as const },
      ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-slate-800/50 p-8"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-4"
          >
            <Badge variant="info" className="px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Ethical AI Content Engine
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to Aegis Viral Engine
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 max-w-xl mb-6"
          >
            Automate the creation of viral TikTok content that promotes ethical AI
            and humanitarian technology, grounded in peer-reviewed research.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/generate">
              <MotionButton size="lg" whileHover={{ scale: 1.02 }}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Content
                <ArrowRight className="w-4 h-4 ml-2" />
              </MotionButton>
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Live Statistics</h2>
        <Button variant="ghost" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card variant="bordered" className="border-amber-500/50 bg-amber-500/10 mb-4">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, index) => (
          <MotionCard
            key={stat.label}
            variant="default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-slate-700 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                {!loading && stat.change !== '-' && (
                  <Badge
                    variant={stat.trend === 'up' ? 'success' : 'danger'}
                    className="text-xs"
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                )}
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <MotionCard
                variant="default"
                className="h-full cursor-pointer hover:border-slate-700/80"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${action.gradient}`}
                    >
                      <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                  </div>
                </CardContent>
              </MotionCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest content generation activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">Generated {item.time}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === 'published' ? 'success' :
                      item.status === 'approved' ? 'info' : 'default'
                    }
                  >
                    {item.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No recent activity</p>
              <p className="text-sm text-slate-500 mt-1">
                Start generating content to see activity here
              </p>
              <Link href="/generate">
                <Button className="mt-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
