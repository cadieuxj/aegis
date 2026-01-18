'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableSnapshot {
  table: string;
  count: number;
  rows: Record<string, unknown>[];
  error?: string | null;
}

interface DatabaseOverview {
  success: boolean;
  tables: TableSnapshot[];
  timestamp: string;
  error?: string;
}

export function DatabaseBrowser() {
  const [data, setData] = useState<DatabaseOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/database/overview');
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to load database overview');
      }
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Supabase Tables
            </CardTitle>
            <CardDescription>
              Snapshot of table contents (latest 10 rows per table).
            </CardDescription>
          </div>
          <Button onClick={fetchOverview} isLoading={loading} variant="secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {!error && data && (
            <p className="text-xs text-slate-500">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {data?.tables?.map((table) => (
        <Card key={table.table}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{table.table}</span>
              <Badge variant="info">{table.count} rows</Badge>
            </CardTitle>
            <CardDescription>
              Showing up to 10 rows. {table.error ? 'Error fetching data.' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {table.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {table.error}
              </div>
            )}
            {!table.error && table.rows.length === 0 && (
              <p className="text-sm text-slate-500">No rows available.</p>
            )}
            {!table.error && table.rows.length > 0 && (
              <pre className="max-h-[320px] overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                {JSON.stringify(table.rows, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
