'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, RefreshCw, BookOpen, Award, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ResearchSource } from '@/types';

interface ResearchFeedProps {
  onSelectSource?: (source: ResearchSource) => void;
}

export function ResearchFeed({ onSelectSource }: ResearchFeedProps) {
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTopic, setSearchTopic] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = async (topic?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = topic
        ? `/api/research?topic=${encodeURIComponent(topic)}&academicOnly=true`
        : '/api/research?academicOnly=true';
      const response = await fetch(url);
      const data = await response.json();

      console.log('Research API response:', data);

      if (data.success) {
        setSources(data.sources || []);
        setCurrentTopic(data.topic || topic || 'Unknown');
      } else {
        setError(data.error || 'Failed to fetch research');
        setSources([]);
      }
    } catch (err) {
      console.error('Error fetching research:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch research');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTopic.trim()) {
      fetchResearch(searchTopic);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Research Feed
              </CardTitle>
              <CardDescription>
                Discover peer-reviewed AI and humanitarian tech research
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchResearch()}
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Search research topics..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" isLoading={loading}>
              Search
            </Button>
          </form>
          {currentTopic && (
            <p className="mt-3 text-sm text-slate-400">
              Current topic: <span className="text-cyan-400">{currentTopic}</span>
            </p>
          )}
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Sources */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Searching academic sources...</p>
              </div>
            </motion.div>
          ) : sources.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No research sources found</p>
              <p className="text-sm text-slate-500 mt-1">
                Try searching for a different topic
              </p>
            </motion.div>
          ) : (
            sources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ResearchSourceCard
                  source={source}
                  onSelect={() => onSelectSource?.(source)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ResearchSourceCardProps {
  source: ResearchSource;
  onSelect?: () => void;
}

function ResearchSourceCard({ source, onSelect }: ResearchSourceCardProps) {
  const credibility = getCredibilityBadge(source.credibilityScore);

  return (
    <Card
      variant="default"
      className="hover:border-slate-700/80 transition-all duration-200 cursor-pointer group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={credibility.variant}>
                <Award className="w-3 h-3 mr-1" />
                {credibility.label}
              </Badge>
              <Badge variant="outline">{source.domain}</Badge>
            </div>

            <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
              {source.title}
            </h3>

            {source.markdown && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {source.markdown.slice(0, 200)}...
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(source.fetchedAt).toLocaleDateString()}
              </span>
              <span>Score: {source.credibilityScore}/100</span>
            </div>
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function getCredibilityBadge(score: number) {
  if (score >= 80) return { variant: 'success' as const, label: 'High Credibility' };
  if (score >= 60) return { variant: 'info' as const, label: 'Good Credibility' };
  if (score >= 40) return { variant: 'warning' as const, label: 'Moderate' };
  return { variant: 'default' as const, label: 'Review Needed' };
}
