'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

export function TikTokPanel() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('PUBLIC_TO_EVERYONE');
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);

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

  useEffect(() => {
    fetchStatus();
  }, []);

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
          disableComment,
          disableDuet,
          disableStitch,
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
          <CardTitle>Manual Publish</CardTitle>
          <CardDescription>
            Provide a public video URL and caption. Auto-posting stays off until you confirm results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input
              placeholder="https://your-cdn.com/video.mp4"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
            />
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                options={[
                  { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
                  { value: 'FOLLOWER_OF_CREATOR', label: 'Followers' },
                  { value: 'FRIENDS', label: 'Friends' },
                ]}
                value={privacyLevel}
                onChange={(event) => setPrivacyLevel(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Safety Controls</Label>
              <div className="space-y-2 text-sm text-slate-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={disableComment}
                    onChange={(event) => setDisableComment(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  Disable comments
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={disableDuet}
                    onChange={(event) => setDisableDuet(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  Disable duet
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={disableStitch}
                    onChange={(event) => setDisableStitch(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  Disable stitch
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePublish}
              isLoading={publishLoading}
              disabled={!status?.connected || !videoUrl}
            >
              Publish to TikTok
            </Button>
            {!status?.connected && (
              <span className="text-xs text-slate-500">Connect your account before publishing.</span>
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
