'use client';

/**
 * ExportButton Component
 *
 * Reusable CSV export button that fetches data and triggers download.
 *
 * @module components/admin/shared/ExportButton
 */

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/utils/export-csv';

interface ExportButtonProps {
  label?: string;
  fetchData: () => Promise<Record<string, unknown>[]>;
  filename: string;
}

export function ExportButton({ label = 'Export CSV', fetchData, filename }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      if (data.length === 0) {
        alert('No data to export.');
        return;
      }
      exportToCSV(filename, data);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700
                 bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                 disabled:opacity-50 transition-colors"
      aria-label={`${label} as CSV file`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Download className="w-4 h-4" />
      }
      {loading ? 'Exporting...' : label}
    </button>
  );
}
