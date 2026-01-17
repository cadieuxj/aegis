'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Clock, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MotionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const performanceMetrics = [
  { label: 'Total Views', value: '124.5K', change: '+18%', trend: 'up', icon: Eye },
  { label: 'Total Likes', value: '8.2K', change: '+12%', trend: 'up', icon: Heart },
  { label: 'Comments', value: '1.4K', change: '+5%', trend: 'up', icon: MessageCircle },
  { label: 'Shares', value: '892', change: '+24%', trend: 'up', icon: Share2 },
];

const topPosts = [
  {
    title: 'AI-Powered Prosthetics Give Amputees New Hope',
    views: 45200,
    engagement: 6.2,
    hookType: 'surprising_fact',
  },
  {
    title: 'How Machine Learning is Predicting Natural Disasters',
    views: 38100,
    engagement: 5.8,
    hookType: 'future_prediction',
  },
  {
    title: 'The Robot That Delivers Medicine to Remote Villages',
    views: 29400,
    engagement: 5.1,
    hookType: 'personal_story',
  },
];

const hookTypePerformance = [
  { type: 'Surprising Fact', avgEngagement: 5.2, count: 12 },
  { type: 'Provocative Question', avgEngagement: 4.8, count: 8 },
  { type: 'Future Prediction', avgEngagement: 4.5, count: 6 },
  { type: 'Personal Story', avgEngagement: 4.1, count: 5 },
  { type: 'Counter-Intuitive', avgEngagement: 3.9, count: 3 },
];

const visualStylePerformance = [
  { style: 'Solarpunk', avgEngagement: 5.4 },
  { style: 'Human-AI', avgEngagement: 5.1 },
  { style: 'Data Viz', avgEngagement: 4.6 },
  { style: 'Holographic', avgEngagement: 4.3 },
  { style: 'Research Lab', avgEngagement: 4.0 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-400 mt-1">
          Track performance and optimize your content strategy
        </p>
      </div>

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
                    <p className="text-xl font-bold text-slate-100">{metric.value}</p>
                  </div>
                </div>
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
            <div className="space-y-4">
              {hookTypePerformance.map((item, index) => (
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
                      max={6}
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
            <div className="space-y-4">
              {visualStylePerformance.map((item, index) => (
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
                    max={6}
                    variant="gradient"
                  />
                </motion.div>
              ))}
            </div>
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
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <motion.div
                key={post.title}
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
                      {post.hookType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <Badge variant="success">{post.engagement}% engagement</Badge>
              </motion.div>
            ))}
          </div>
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
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
            >
              <h4 className="font-medium text-amber-400 mb-2">
                Low Performers Detected
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                3 posts are performing below the 20th percentile. The algorithm suggests:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  Switch from &quot;Counter-Intuitive&quot; to &quot;Surprising Fact&quot; hooks for science topics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  Use &quot;Solarpunk&quot; or &quot;Human-AI&quot; visual styles for better retention
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  Consider more emotional framing for humanitarian tech content
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
            >
              <h4 className="font-medium text-emerald-400 mb-2">
                Best Performing Combinations
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                These combinations consistently outperform:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  &quot;Surprising Fact&quot; hook + &quot;Solarpunk&quot; visuals (avg 5.8% engagement)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  &quot;Personal Story&quot; hook + &quot;Human-AI&quot; visuals (avg 5.4% engagement)
                </li>
              </ul>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
