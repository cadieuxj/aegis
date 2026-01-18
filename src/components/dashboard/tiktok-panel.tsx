'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, ExternalLink, RefreshCw, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TikTokCreatorInfo } from '@/lib/tiktok';

interface TikTokStatus {
  connected: boolean;
  configured: boolean;
  connection?: {
    openId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    scopes?: string[];
    expiresAt?: string;
    refreshExpiresAt?: string | null;
    updatedAt?: string;
  };
  error?: string;
}

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Public',
  MUTUAL_FOLLOW_FRIENDS: 'Friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  SELF_ONLY: 'Only Me',
};

export function TikTokPanel() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<TikTokCreatorInfo | null>(null);
  const [creatorInfoLoading, setCreatorInfoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  // No default privacy level - user must select
  const [privacyLevel, setPrivacyLevel] = useState('');
  // Interaction settings default to OFF (false = disabled, user enables)
  const [enableComment, setEnableComment] = useState(false);
  const [enableDuet, setEnableDuet] = useState(false);
  const [enableStitch, setEnableStitch] = useState(false);
  // Consent declaration required before publishing
  const [consentGiven, setConsentGiven] = useState(false);

  const oauthNotice = useMemo(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      return { type: 'success', message: 'TikTok connected successfully.' };
    }
    if (error) {
      let message = error;
      try {
        message = decodeURIComponent(error);
      } catch {
        message = error;
      }
      return { type: 'error', message };
    }
    return null;
  }, [searchParams]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setStatus({
        connected: false,
        configured: false,
        error: err instanceof Error ? err.message : 'Failed to load TikTok status',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorInfo = async () => {
    setCreatorInfoLoading(true);
    try {
      const response = await fetch('/api/tiktok/creator-info');
      const data = await response.json();
      if (data.success && data.data) {
        setCreatorInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch creator info:', err);
    } finally {
      setCreatorInfoLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Fetch creator info when connected
  useEffect(() => {
    if (status?.connected) {
      fetchCreatorInfo();
    }
  }, [status?.connected]);

  const handleConnect = () => {
    window.location.href = '/api/tiktok/connect';
  };

  const handlePublish = async () => {
    setPublishLoading(true);
    setPublishError(null);
    setPublishResult(null);

    try {
      const response = await fetch('/api/tiktok/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          videoUrl,
          privacyLevel,
          // Send enable flags, API route will invert to disable flags
          enableComment,
          enableDuet,
          enableStitch,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Publish failed');
      }

      setPublishResult(JSON.stringify(data.data, null, 2));
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishLoading(false);
    }
  };

  // Build privacy options from creator info API response
  const privacyOptions = useMemo(() => {
    if (!creatorInfo?.privacy_level_options) {
      return [];
    }
    return creatorInfo.privacy_level_options.map((level) => ({
      value: level,
      label: PRIVACY_LABELS[level] || level,
    }));
  }, [creatorInfo]);

  const canPublish =
    status?.connected &&
    videoUrl.trim() !== '' &&
    privacyLevel !== '' &&
    consentGiven;

  return (
    <div className="space-y-6">
      {oauthNotice && (
        <Card variant="bordered" className={oauthNotice.type === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-emerald-500/40 bg-emerald-500/10'}>
          <CardContent className="py-4">
            <div className={`flex items-center gap-2 ${oauthNotice.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {oauthNotice.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <span>{oauthNotice.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            TikTok Connection
            {status?.connected && <Badge variant="success">Connected</Badge>}
            {status && !status.connected && status.configured && (
              <Badge variant="warning">Not Connected</Badge>
            )}
            {status && !status.configured && <Badge variant="danger">Missing Keys</Badge>}
          </CardTitle>
          <CardDescription>
            Connect your TikTok account to publish videos manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{status.error}</span>
            </div>
          )}

          {status?.connected && status.connection && (
            <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800">
                {status.connection.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={status.connection.avatarUrl} alt="TikTok avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    No Avatar
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">
                  {status.connection.displayName || 'TikTok Creator'}
                </p>
                <p className="text-xs text-slate-500">
                  Open ID: {status.connection.openId}
                </p>
                {status.connection.expiresAt && (
                  <p className="text-xs text-slate-500">
                    Access token expires: {new Date(status.connection.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Button variant="secondary" onClick={fetchStatus} isLoading={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          )}

          {!status?.connected && (
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleConnect} disabled={!status || !status.configured} isLoading={loading}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect TikTok
              </Button>
              <Button variant="secondary" onClick={fetchStatus} isLoading={loading}>
                Refresh Status
              </Button>
              {status && !status.configured && (
                <span className="text-xs text-slate-500">
                  Add `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, and `TIKTOK_REDIRECT_URI` to your environment.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post to TikTok</CardTitle>
          <CardDescription>
            Provide a public video URL and configure your post settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Creator Info Display - Required by TikTok UX Guidelines */}
          {status?.connected && (
            <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
              <div className="flex items-center gap-4">
                {creatorInfoLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading creator info...</span>
                  </div>
                ) : creatorInfo ? (
                  <>
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                      {creatorInfo.creator_avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={creatorInfo.creator_avatar_url}
                          alt="Creator avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Posting as: @{creatorInfo.creator_username}
                      </p>
                      <p className="text-xs text-slate-400">{creatorInfo.creator_nickname}</p>
                      {creatorInfo.max_video_post_duration_sec && (
                        <p className="text-xs text-slate-500">
                          Max video duration: {Math.floor(creatorInfo.max_video_post_duration_sec / 60)}min
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Could not load creator info. Try refreshing.</span>
                    <Button variant="ghost" size="sm" onClick={fetchCreatorInfo}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input
              placeholder="https://your-cdn.com/video.mp4"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
            />
            <p className="text-xs text-slate-500">
              Must be a publicly accessible video URL (MP4, WebM).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Caption</Label>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              placeholder="Write a caption that fits TikTok's guidelines..."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Privacy Level <span className="text-red-400">*</span>
              </Label>
              {privacyOptions.length > 0 ? (
                <>
                  <Select
                    options={[
                      { value: '', label: 'Select privacy level...' },
                      ...privacyOptions,
                    ]}
                    value={privacyLevel}
                    onChange={(event) => setPrivacyLevel(event.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    You must select a privacy level before posting.
                  </p>
                </>
              ) : (
                <div className="text-sm text-slate-500 p-3 bg-slate-900/50 rounded-lg">
                  {status?.connected
                    ? 'Loading privacy options...'
                    : 'Connect your TikTok account to see available options.'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Interaction Settings</Label>
              <p className="text-xs text-slate-500 -mt-1">
                Enable features you want to allow on your post.
              </p>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableComment}
                    onChange={(event) => setEnableComment(event.target.checked)}
                    disabled={creatorInfo?.comment_disabled}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                  />
                  <span className={creatorInfo?.comment_disabled ? 'text-slate-600' : 'text-slate-300'}>
                    Allow comments
                  </span>
                  {creatorInfo?.comment_disabled && (
                    <span className="text-xs text-slate-600">(Not available)</span>
                  )}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDuet}
                    onChange={(event) => setEnableDuet(event.target.checked)}
                    disabled={creatorInfo?.duet_disabled}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                  />
                  <span className={creatorInfo?.duet_disabled ? 'text-slate-600' : 'text-slate-300'}>
                    Allow duets
                  </span>
                  {creatorInfo?.duet_disabled && (
                    <span className="text-xs text-slate-600">(Not available)</span>
                  )}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableStitch}
                    onChange={(event) => setEnableStitch(event.target.checked)}
                    disabled={creatorInfo?.stitch_disabled}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                  />
                  <span className={creatorInfo?.stitch_disabled ? 'text-slate-600' : 'text-slate-300'}>
                    Allow stitches
                  </span>
                  {creatorInfo?.stitch_disabled && (
                    <span className="text-xs text-slate-600">(Not available)</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Consent Declaration - Required by TikTok UX Guidelines */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(event) => setConsentGiven(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-300">
                I confirm that I have the rights to post this content and agree to{' '}
                <a
                  href="https://www.tiktok.com/legal/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  TikTok&apos;s Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://www.tiktok.com/community-guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  Community Guidelines
                </a>
                .
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handlePublish}
              isLoading={publishLoading}
              disabled={!canPublish}
            >
              Publish to TikTok
            </Button>
            {!status?.connected && (
              <span className="text-xs text-slate-500">Connect your account before publishing.</span>
            )}
            {status?.connected && !privacyLevel && (
              <span className="text-xs text-slate-500">Select a privacy level to continue.</span>
            )}
            {status?.connected && privacyLevel && !consentGiven && (
              <span className="text-xs text-slate-500">Accept the terms to continue.</span>
            )}
          </div>

          {publishError && (
            <div className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {publishError}
            </div>
          )}

          {publishResult && (
            <pre className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-300 overflow-x-auto">
              {publishResult}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
