'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ResponsiveTable, { Column } from '@/components/admin/ResponsiveTable';

interface Contest {
  id: string;
  title: string;
  prizeDescription: string;
  totalSlots: number;
  slotPrice: number;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  creatorId: string;
  creator?: {
    id: string;
    name: string | null;
    email: string;
  };
  winnerId?: string | null;
  createdAt: string;
  _count?: {
    entries: number;
  };
}

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingContest, setDeletingContest] = useState<string | null>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/contests');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch contests (${response.status})`);
      }
      
      const data = await response.json();
      setContests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contestId: string) => {
    if (!confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      return;
    }

    setDeletingContest(contestId);
    try {
      const response = await fetch(`/api/admin/contests/${contestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContests();
        alert('Contest deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to delete contest'}`);
      }
    } catch (err) {
      console.error('Error deleting contest:', err);
      alert('Error deleting contest.');
    } finally {
      setDeletingContest(null);
    }
  };

  const filteredContests = contests.filter(contest => {
    if (statusFilter === 'all') return true;
    return contest.status === statusFilter;
  });

  // Define columns for ResponsiveTable
  const columns: Column<Contest>[] = [
    // HIGH PRIORITY
    {
      key: 'title',
      label: 'Title',
      priority: 'high',
      render: (contest) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{contest.title}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{contest.prizeDescription}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (contest) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          contest.status === 'OPEN' ? 'bg-green-100 text-green-800' :
          contest.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {contest.status}
        </span>
      )
    },
    {
      key: 'entries',
      label: 'Entries',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (contest) => {
        const entriesCount = contest._count?.entries || 0;
        const slotsSold = entriesCount;
        return <span>{slotsSold} / {contest.totalSlots}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      mobileLabel: '',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (contest) => (
        <button
          onClick={() => handleDelete(contest.id)}
          disabled={deletingContest === contest.id}
          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          {deletingContest === contest.id ? 'Deleting...' : 'Delete'}
        </button>
      )
    },
    // MEDIUM PRIORITY
    {
      key: 'creator',
      label: 'Creator',
      priority: 'medium',
      className: 'whitespace-nowrap',
      render: (contest) => (
        <span className="text-sm">{contest.creator?.name || contest.creator?.email || 'Unknown'}</span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      mobileLabel: 'Slot Price',
      priority: 'medium',
      className: 'whitespace-nowrap',
      render: (contest) => <span>€{contest.slotPrice.toFixed(2)}</span>
    },
    // LOW PRIORITY
    {
      key: 'created',
      label: 'Created',
      mobileLabel: 'Created Date',
      priority: 'low',
      className: 'whitespace-nowrap',
      render: (contest) => <span>{new Date(contest.createdAt).toLocaleDateString()}</span>
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contest Management</h1>
        <Link
          href="/admin" 
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Contests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Contests ({filteredContests.length})
          </h2>
        </div>
        <div className="p-4">
          <ResponsiveTable
            data={filteredContests}
            columns={columns}
            keyExtractor={(contest) => contest.id}
            emptyMessage="No contests found"
          />
        </div>
      </div>
    </div>
  );
}
