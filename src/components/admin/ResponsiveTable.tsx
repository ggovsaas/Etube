'use client';

import { useState } from 'react';

export interface Column<T = any> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  mobileLabel?: string; // Optional custom label for mobile card
  priority: 'high' | 'medium' | 'low'; // Display priority on mobile
  className?: string; // Optional className for table cells
}

export interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export default function ResponsiveTable<T = any>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data found'
}: ResponsiveTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Separate columns by priority
  const highPriorityColumns = columns.filter(col => col.priority === 'high');
  const mediumLowColumns = columns.filter(col => col.priority === 'medium' || col.priority === 'low');

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (lg+) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${column.className || ''}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< lg) */}
      <div className="lg:hidden space-y-3">
        {data.map((item) => {
          const itemKey = keyExtractor(item);
          const isExpanded = expandedRows.has(itemKey);

          return (
            <div
              key={itemKey}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* High Priority Fields - Always Visible */}
              <div className="p-4 space-y-3">
                {highPriorityColumns.map((column, idx) => (
                  <div key={column.key}>
                    {column.mobileLabel !== '' && (
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {column.mobileLabel || column.label}
                      </div>
                    )}
                    <div className={idx === 0 ? "text-sm font-medium text-gray-900" : "text-sm text-gray-700"}>
                      {column.render(item)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Medium/Low Priority Fields - Expandable */}
              {mediumLowColumns.length > 0 && (
                <>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">
                      {mediumLowColumns.map((column) => (
                        <div key={column.key}>
                          {column.mobileLabel !== '' && (
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                              {column.mobileLabel || column.label}
                            </div>
                          )}
                          <div className="text-sm text-gray-700">
                            {column.render(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleRowExpansion(itemKey)}
                    className="w-full py-2.5 px-4 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-t border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show Less</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
