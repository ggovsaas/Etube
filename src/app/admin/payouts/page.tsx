'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveTable, { Column } from '@/components/admin/ResponsiveTable';

interface PayoutRequest {
  id: string;
  providerId: string;
  amount: number;
  payoutMethod: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  rejectionReason: string | null;
  provider: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface SummaryStats {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalPlatformFees: number;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'>('REQUESTED');
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayouts();
    fetchSummary();
  }, [filter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' ? '/api/admin/payouts' : `/api/admin/payouts?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/admin/payouts/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve and mark this payout as paid?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payouts/${id}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        await fetchPayouts();
        await fetchSummary();
      } else {
        alert('Failed to approve payout');
      }
    } catch (error) {
      console.error('Error approving payout:', error);
      alert('Error approving payout');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`/api/admin/payouts/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        setRejectingId(null);
        setRejectionReason('');
        await fetchPayouts();
        await fetchSummary();
      } else {
        alert('Failed to reject payout');
      }
    } catch (error) {
      console.error('Error rejecting payout:', error);
      alert('Error rejecting payout');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Define columns for ResponsiveTable
  const columns: Column<PayoutRequest>[] = [
    // HIGH PRIORITY
    {
      key: 'provider',
      label: 'Provider',
      priority: 'high',
      render: (payout) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{payout.provider.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{payout.provider.email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      priority: 'high',
      className: 'whitespace-nowrap font-semibold',
      render: (payout) => <span>{formatCurrency(payout.amount)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (payout) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            payout.status === 'COMPLETED'
              ? 'bg-green-100 text-green-800'
              : payout.status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : payout.status === 'PROCESSING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {payout.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      mobileLabel: '',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (payout) => (
        <div>
          {payout.status === 'REQUESTED' && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleApprove(payout.id)}
                className="text-green-600 hover:text-green-900 font-semibold text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectingId(payout.id)}
                className="text-red-600 hover:text-red-900 font-semibold text-sm"
              >
                Reject
              </button>
            </div>
          )}
          {payout.status === 'REJECTED' && payout.rejectionReason && (
            <p className="text-xs text-red-600">{payout.rejectionReason}</p>
          )}
        </div>
      )
    },
    // MEDIUM PRIORITY
    {
      key: 'method',
      label: 'Method',
      mobileLabel: 'Payout Method',
      priority: 'medium',
      className: 'whitespace-nowrap',
      render: (payout) => <span>{payout.payoutMethod}</span>
    },
    {
      key: 'requested',
      label: 'Requested',
      mobileLabel: 'Requested Date',
      priority: 'medium',
      className: 'whitespace-nowrap',
      render: (payout) => <span>{new Date(payout.requestedAt).toLocaleDateString()}</span>
    }
  ];

  if (loading && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
        <div className="flex gap-2">
          {(['ALL', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Pending</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalPending)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Processing</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalProcessing)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Completed</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCompleted)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Platform Fees Collected</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalPlatformFees)}</p>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <ResponsiveTable
            data={payouts}
            columns={columns}
            keyExtractor={(payout) => payout.id}
            emptyMessage="No payout requests found."
          />
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Payout Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleReject(rejectingId)}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


