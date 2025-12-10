'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReportData {
  totalUsers: number;
  totalProfiles: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalMedia: number;
  totalReviews: number;
  usersByRole: Record<string, number>;
  listingsByStatus: Record<string, number>;
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/reports');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch report data (${response.status})`);
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) return;

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else {
      // CSV export
      const csvRows = [
        ['Metric', 'Value'],
        ['Total Users', reportData.totalUsers.toString()],
        ['Total Profiles', reportData.totalProfiles.toString()],
        ['Total Listings', reportData.totalListings.toString()],
        ['Active Listings', reportData.activeListings.toString()],
        ['Pending Listings', reportData.pendingListings.toString()],
        ['Total Media', reportData.totalMedia.toString()],
        ['Total Reviews', reportData.totalReviews.toString()],
      ];
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No report data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Data Exports</h1>
        <div className="flex items-center space-x-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="csv">Export as CSV</option>
            <option value="json">Export as JSON</option>
          </select>
          <button
            onClick={handleExport}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Export Report
          </button>
          <Link
            href="/admin" 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{reportData.totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Profiles</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{reportData.totalProfiles}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Active Listings</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{reportData.activeListings}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending Listings</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{reportData.pendingListings}</div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h2>
          <div className="space-y-2">
            {Object.entries(reportData.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{role}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Listings by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings by Status</h2>
          <div className="space-y-2">
            {Object.entries(reportData.listingsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Media Files</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalMedia}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Reviews</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalReviews}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Listings</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalListings}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


