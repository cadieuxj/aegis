'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Play,
  Pause,
  Save,
  Check,
  Edit3,
  GripVertical,
  RefreshCw,
  Download,
  Volume2,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button, MotionButton } from '@/components/ui/button';
import { Textarea, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Post, VisualAsset, ScriptSection } from '@/types';

interface PostEditorProps {
  postId?: string;
}

export function PostEditor({ postId }: PostEditorProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'audio' | 'visuals'>('script');
  const [error, setError] = useState<string | null>(null);

  // Script editing state
  const [hookText, setHookText] = useState('');
  const [unlockText, setUnlockText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Visual state
  const [selectedVisuals, setSelectedVisuals] = useState<VisualAsset[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    } else {
      fetchLatestPost();
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/posts?id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load post');
        return;
      }

      if (data.success && data.post) {
        setPost(data.post);
        initializeFromPost(data.post);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPost = async () => {
    setError(null);
    try {
      // Try to fetch draft posts first (unpublished posts)
      let response = await fetch('/api/posts?status=draft&limit=1');
      let data = await response.json();

      // If no draft posts, try fetching all posts
      if (!data.posts?.length) {
        response = await fetch('/api/posts?limit=1');
        data = await response.json();
      }

      if (!response.ok) {
        setError(data.error || 'Failed to load posts');
        return;
      }

      if (data.success && data.posts?.length > 0) {
        await fetchPost(data.posts[0].id);
        return;
      }

      setError('No posts available');
    } catch (error) {
      console.error('Error fetching latest post:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const initializeFromPost = (post: Post) => {
    if (post.script) {
      const hook = post.script.sections.find((s) => s.type === 'hook');
      const unlock = post.script.sections.find((s) => s.type === 'unlock');
      const cta = post.script.sections.find((s) => s.type === 'cta');

      setHookText(hook?.text || '');
      setUnlockText(unlock?.text || '');
      setCtaText(cta?.text || '');
    }
    setSelectedVisuals(post.visualAssets || []);
  };

  const handleSave = async () => {
    if (!post) return;

    setSaving(true);
    try {
      setError(null);
      const sections: ScriptSection[] = [
        { type: 'hook', startTime: 0, endTime: 3, text: hookText },
        { type: 'unlock', startTime: 3, endTime: 30, text: unlockText },
        { type: 'cta', startTime: 30, endTime: 45, text: ctaText },
      ];
      const fullText = sections.map((s) => s.text).join(' ');

      const response = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          script: {
            id: post.scriptId,
            sections,
            fullText,
          },
          visuals: selectedVisuals.map((visual, index) => ({
            id: visual.id,
            sequence: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post');
      }

      setPost({
        ...post,
        script: post.script
          ? {
              ...post.script,
              sections,
              fullText,
            }
          : post.script,
        visualAssets: selectedVisuals,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      setError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!post) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, status: 'approved' }),
      });

      if (response.ok) {
        setPost({ ...post, status: 'approved' });
      }
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <Card variant="bordered" className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">{error || 'No post selected'}</p>
        <p className="text-sm text-slate-500 mt-1">
          Generate content first or select a post to edit
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {post.script?.title || 'Untitled Post'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    post.status === 'approved'
                      ? 'success'
                      : post.status === 'published'
                      ? 'info'
                      : 'default'
                  }
                >
                  {post.status}
                </Badge>
                <span className="text-sm text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                isLoading={saving}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
              {post.status === 'draft' && (
                <MotionButton onClick={handleApprove} whileHover={{ scale: 1.02 }}>
                  <Check className="w-4 h-4 mr-1" />
                  Approve & Package
                </MotionButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['script', 'audio', 'visuals'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'script' && <FileText className="w-4 h-4 mr-1" />}
            {tab === 'audio' && <Volume2 className="w-4 h-4 mr-1" />}
            {tab === 'visuals' && <ImageIcon className="w-4 h-4 mr-1" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'script' && (
          <motion.div
            key="script"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ScriptEditor
              hookText={hookText}
              unlockText={unlockText}
              ctaText={ctaText}
              isEditing={isEditing}
              onHookChange={setHookText}
              onUnlockChange={setUnlockText}
              onCtaChange={setCtaText}
            />
          </motion.div>
        )}

        {activeTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AudioPlayer
              audioUrl={post.audioAsset?.audioUrl}
              voiceName={post.audioAsset?.voiceName}
              duration={post.audioAsset?.duration}
              isPlaying={isPlaying}
              audioRef={audioRef}
              onTogglePlayback={togglePlayback}
              onEnded={() => setIsPlaying(false)}
            />
          </motion.div>
        )}

        {activeTab === 'visuals' && (
          <motion.div
            key="visuals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <VisualGallery
              visuals={selectedVisuals}
              previewIndex={previewIndex}
              isFullscreen={isFullscreen}
              onReorder={setSelectedVisuals}
              onPreviewChange={setPreviewIndex}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScriptEditor({
  hookText,
  unlockText,
  ctaText,
  isEditing,
  onHookChange,
  onUnlockChange,
  onCtaChange,
}: {
  hookText: string;
  unlockText: string;
  ctaText: string;
  isEditing: boolean;
  onHookChange: (value: string) => void;
  onUnlockChange: (value: string) => void;
  onCtaChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
              1
            </span>
            Hook (0-3 seconds)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={hookText}
              onChange={(e) => onHookChange(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-slate-300">{hookText}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
              2
            </span>
            The Unlock (3-30 seconds)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={unlockText}
              onChange={(e) => onUnlockChange(e.target.value)}
              className="min-h-[120px]"
            />
          ) : (
            <p className="text-slate-300">{unlockText}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
              3
            </span>
            Call to Action (30-45 seconds)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={ctaText}
              onChange={(e) => onCtaChange(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-slate-300">{ctaText}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AudioPlayer({
  audioUrl,
  voiceName,
  duration,
  isPlaying,
  audioRef,
  onTogglePlayback,
  onEnded,
}: {
  audioUrl?: string;
  voiceName?: string;
  duration?: number;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTogglePlayback: () => void;
  onEnded: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [audioRef]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <Card variant="bordered" className="text-center py-8">
        <Volume2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400">No audio available</p>
      </Card>
    );
  }

  return (
    <Card variant="glow">
      <CardContent className="py-6">
        <div className="flex flex-col items-center">
          <motion.button
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTogglePlayback}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </motion.button>

          <p className="text-sm text-slate-400 mt-4">
            Voice: <span className="text-cyan-400">{voiceName || 'Unknown'}</span>
          </p>

          <div className="w-full max-w-md mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  style={{
                    width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                  }}
                />
              </div>
              <span>{formatTime(duration || 0)}</span>
            </div>
          </div>

          <audio ref={audioRef} src={audioUrl} onEnded={onEnded} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}

function VisualGallery({
  visuals,
  previewIndex,
  isFullscreen,
  onReorder,
  onPreviewChange,
  onToggleFullscreen,
}: {
  visuals: VisualAsset[];
  previewIndex: number;
  isFullscreen: boolean;
  onReorder: (visuals: VisualAsset[]) => void;
  onPreviewChange: (index: number) => void;
  onToggleFullscreen: () => void;
}) {
  if (visuals.length === 0) {
    return (
      <Card variant="bordered" className="text-center py-8">
        <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400">No visuals available</p>
      </Card>
    );
  }

  const currentVisual = visuals[previewIndex];

  return (
    <div className="space-y-4">
      {/* Preview */}
      <Card variant="glow" className="overflow-hidden">
        <div className="relative aspect-video bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentVisual.id}
              src={currentVisual.imageUrl}
              alt={currentVisual.theme}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 backdrop-blur"
              onClick={() => onPreviewChange(Math.max(0, previewIndex - 1))}
              disabled={previewIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 backdrop-blur"
              onClick={() => onPreviewChange(Math.min(visuals.length - 1, previewIndex + 1))}
              disabled={previewIndex === visuals.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 backdrop-blur"
              onClick={onToggleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-sm text-white">
              {previewIndex + 1} of {visuals.length}: {currentVisual.theme}
            </p>
          </div>
        </div>
      </Card>

      {/* Thumbnails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sequence Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-3">
            Drag to reorder visuals in the final video
          </p>
          <Reorder.Group
            axis="x"
            values={visuals}
            onReorder={onReorder}
            className="flex gap-3 overflow-x-auto pb-2"
          >
            {visuals.map((visual, index) => (
              <Reorder.Item
                key={visual.id}
                value={visual}
                className={cn(
                  'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2',
                  index === previewIndex
                    ? 'border-cyan-500'
                    : 'border-transparent hover:border-slate-600'
                )}
                onClick={() => onPreviewChange(index)}
              >
                <img
                  src={visual.imageUrl}
                  alt={visual.theme}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 px-1">
                  <span className="text-[10px] text-white">{index + 1}</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>
    </div>
  );
}
