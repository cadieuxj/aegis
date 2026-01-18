import { DatabaseBrowser } from '@/components/dashboard/database-browser';

export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Database Explorer</h1>
        <p className="text-slate-400 mt-1">
          Review recent rows from each Supabase table without leaving the dashboard.
        </p>
      </div>
      <DatabaseBrowser />
    </div>
  );
}
