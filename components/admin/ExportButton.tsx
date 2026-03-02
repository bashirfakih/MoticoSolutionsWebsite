/**
 * Export Button Component
 *
 * Provides CSV export functionality for admin data tables
 */

'use client';

import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ExportOption {
  label: string;
  href: string;
}

interface ExportButtonProps {
  options: ExportOption[];
  label?: string;
}

export default function ExportButton({ options, label = 'Export' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setIsExporting(option.label);
    try {
      // Trigger download
      const response = await fetch(option.href);
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'export.csv';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  if (options.length === 1) {
    return (
      <button
        onClick={() => handleExport(options[0])}
        disabled={!!isExporting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
        {isExporting ? 'Exporting...' : label}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleExport(option)}
                  disabled={!!isExporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {isExporting === option.label ? 'Exporting...' : option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
