'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Database,
  Mic,
  Image,
  Brain,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConnectionResult {
  service: string;
  status: 'success' | 'error' | 'missing_key';
  message: string;
  data?: unknown;
  latency?: number;
}

interface TestResults {
  success: boolean;
  summary: string;
  results: ConnectionResult[];
  timestamp: string;
}

const serviceIcons: Record<string, React.ReactNode> = {
  'Firecrawl': <Search className="w-5 h-5" />,
  'Anthropic (Claude)': <Brain className="w-5 h-5" />,
  'Replicate (FLUX)': <Image className="w-5 h-5" />,
  'ElevenLabs': <Mic className="w-5 h-5" />,
  'Supabase': <Database className="w-5 h-5" />,
};

export default function DebugPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-connections');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run tests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ConnectionResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'missing_key':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: ConnectionResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Connected</Badge>;
      case 'error':
        return <Badge variant="danger">Error</Badge>;
      case 'missing_key':
        return <Badge variant="warning">Missing Key</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Connection Debug</h1>
          <p className="text-slate-400 mt-1">
            Test all API connections and verify configuration
          </p>
        </div>
        <Button onClick={runTests} isLoading={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Tests
        </Button>
      </div>

      {error && (
        <Card variant="bordered" className="border-red-500/50 bg-red-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!results && !loading && (
        <Card variant="glow">
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              Ready to Test Connections
            </h3>
            <p className="text-slate-400 mb-4">
              Click the button above to test all API connections
            </p>
            <Button onClick={runTests}>Run Connection Tests</Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Testing connections...</p>
          </CardContent>
        </Card>
      )}

      {results && !loading && (
        <>
          {/* Summary Card */}
          <Card variant={results.success ? 'glow' : 'bordered'}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {results.success ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-100">{results.summary}</h3>
                    <p className="text-sm text-slate-400">
                      Last tested: {new Date(results.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge variant={results.success ? 'success' : 'warning'}>
                  {results.success ? 'All Systems Go' : 'Issues Detected'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Individual Results */}
          <div className="grid gap-4">
            {results.results.map((result, index) => (
              <motion.div
                key={result.service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          result.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : result.status === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {serviceIcons[result.service] || <Zap className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-200">{result.service}</h4>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{result.message}</p>
                          {result.latency && (
                            <p className="text-xs text-slate-500 mt-1">
                              Latency: {result.latency}ms
                            </p>
                          )}
                          {result.data !== undefined && result.data !== null && (
                            <pre className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-400 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      {getStatusIcon(result.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Configuration Help */}
          {results.results.some(r => r.status === 'missing_key') && (
            <Card variant="bordered" className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400">Configuration Required</CardTitle>
                <CardDescription>
                  Some API keys are missing. Add them to your .env.local file:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-800/50 rounded-lg text-sm text-slate-300 overflow-x-auto">
{`# Add to .env.local

FIRECRAWL_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_key_here
REPLICATE_MIN_INTERVAL_MS=11000
ELEVENLABS_API_KEY=your_key_here
TIKTOK_CLIENT_KEY=your_key_here
TIKTOK_CLIENT_SECRET=your_key_here
TIKTOK_REDIRECT_URI=your_url_here
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here`}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
