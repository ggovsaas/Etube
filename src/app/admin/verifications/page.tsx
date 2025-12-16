'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VerificationRequest {
  id: string;
  userId: string;
  profileId: string | null;
  photoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  profile: {
    id: string;
    name: string | null;
    isVerified: boolean;
  } | null;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/verifications?status=${statusFilter}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch verifications (${response.status})`);
      }
      
      const data = await response.json();
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this verification? This will mark the profile as verified.')) {
      return;
    }

    setProcessing(id);
    try {
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        fetchVerifications();
        alert('Verification approved successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to approve verification'}`);
      }
    } catch (err) {
      console.error('Error approving verification:', err);
      alert('Error approving verification.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this verification?')) {
      return;
    }

    setProcessing(id);
    try {
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (response.ok) {
        setRejectingId(null);
        setRejectionReason('');
        fetchVerifications();
        alert('Verification rejected successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to reject verification'}`);
      }
    } catch (err) {
      console.error('Error rejecting verification:', err);
      alert('Error rejecting verification.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading verifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Photo Verifications</h1>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-3 py-2 text-sm sm:px-4 rounded-lg hover:bg-gray-700 text-center"
        >
          ← Back to Dashboard
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
            onChange={(e) => setStatusFilter(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {statusFilter} Verifications ({verifications.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {verifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No {statusFilter.toLowerCase()} verifications found</div>
            </div>
          ) : (
            verifications.map((verification) => (
              <div key={verification.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-6">
                  {/* Verification Photo */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={verification.photoUrl}
                        alt="Verification photo"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 128px, 192px"
                      />
                    </div>
                  </div>

                  {/* Verification Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {verification.user.name || verification.user.email}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        verification.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        verification.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {verification.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {verification.user.email}</p>
                      {verification.profile && (
                        <p><strong>Profile:</strong> {verification.profile.name || 'N/A'}</p>
                      )}
                      <p><strong>Submitted:</strong> {new Date(verification.createdAt).toLocaleString()}</p>
                      {verification.reviewedAt && (
                        <p><strong>Reviewed:</strong> {new Date(verification.reviewedAt).toLocaleString()}</p>
                      )}
                      {verification.rejectionReason && (
                        <p className="text-red-600"><strong>Rejection Reason:</strong> {verification.rejectionReason}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {verification.status === 'PENDING' && (
                      <div className="mt-4 flex items-center space-x-3">
                        <button
                          onClick={() => handleApprove(verification.id)}
                          disabled={processing === verification.id}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === verification.id ? 'Processing...' : 'Approve'}
                        </button>
                        {rejectingId === verification.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Rejection reason..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleReject(verification.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleReject(verification.id)}
                              disabled={processing === verification.id || !rejectionReason.trim()}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason('');
                              }}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(verification.id)}
                            disabled={processing === verification.id}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



