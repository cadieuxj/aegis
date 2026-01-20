'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Database, ChevronDown, ChevronRight, Layers, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

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

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const totalRows = data?.tables?.reduce((sum, table) => sum + table.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-6 h-6 text-cyan-400" />
                Database Overview
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time snapshot of your Supabase database
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
                variant="ghost"
                size="sm"
              >
                <Layers className="w-4 h-4 mr-2" />
                {viewMode === 'compact' ? 'Detailed' : 'Compact'}
              </Button>
              <Button onClick={fetchOverview} isLoading={loading} variant="secondary" size="sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Dashboard */}
      {data && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="glow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Tables</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">{data.tables.length}</p>
                </div>
                <Database className="w-10 h-10 text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Rows</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{totalRows.toLocaleString()}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glow" className="sm:col-span-2 lg:col-span-1">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-sm font-medium text-slate-300 mt-1">
                    {new Date(data.timestamp).toLocaleString()}
                  </p>
                </div>
                <RefreshCw className="w-10 h-10 text-slate-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card variant="bordered">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-red-400 font-medium">{error}</p>
              <Button onClick={fetchOverview} variant="secondary" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables List */}
      {data?.tables?.map((table) => (
        <Card key={table.table} variant="bordered">
          <CardHeader
            className="cursor-pointer hover:bg-slate-900/50 transition-colors"
            onClick={() => toggleTable(table.table)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {expandedTables.has(table.table) ? (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <CardTitle className="text-lg">{table.table}</CardTitle>
                  <CardDescription className="mt-1">
                    {table.error ? (
                      <span className="text-red-400">Error loading data</span>
                    ) : (
                      `${table.rows.length} of ${table.count} rows shown`
                    )}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={table.count > 0 ? 'info' : 'default'} className="text-sm px-3 py-1">
                {table.count} rows
              </Badge>
            </div>
          </CardHeader>

          <AnimatePresence>
            {expandedTables.has(table.table) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="border-t border-slate-800">
                  {table.error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm py-4">
                      <AlertCircle className="w-4 h-4" />
                      {table.error}
                    </div>
                  )}
                  {!table.error && table.rows.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No rows available</p>
                    </div>
                  )}
                  {!table.error && table.rows.length > 0 && (
                    <div className="py-4">
                      {viewMode === 'compact' ? (
                        <div className="overflow-x-auto">
                          <pre className="max-h-[400px] overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                            {JSON.stringify(table.rows, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {table.rows.map((row, idx) => (
                            <Card key={idx} variant="bordered" className="bg-slate-900/40">
                              <CardContent className="py-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(row).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-xs font-medium text-cyan-400 mb-1">
                                        {key}
                                      </span>
                                      <span className={cn(
                                        "text-sm break-all",
                                        value === null ? "text-slate-600 italic" : "text-slate-300"
                                      )}>
                                        {value === null ? 'null' :
                                         typeof value === 'object' ? JSON.stringify(value, null, 2) :
                                         String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}
