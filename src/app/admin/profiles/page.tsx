'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ResponsiveTable, { Column } from '@/components/admin/ResponsiveTable';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
  id: string;
  name: string;
  age: number;
  city: string;
  isVerified: boolean;
  isOnline: boolean;
    rating: number;
  };
}

export default function AdminProfilesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 403) {
          throw new Error('Admin access denied. Please make sure you are logged in with an admin account.');
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else {
          throw new Error(errorData.error || `Failed to fetch users (${response.status})`);
        }
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone and will also delete associated listings and media.')) {
      return;
    }

    setDeleting(profileId);
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
        alert('Profile deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting profile: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Error deleting profile.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user account? This will permanently delete the user, their profile, listings, and all associated data. This action cannot be undone.')) {
      return;
    }

    setDeletingUser(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting user: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user.');
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      ESCORT: 'bg-pink-100 text-pink-800',
      USER: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  // Define columns for ResponsiveTable
  const columns: Column<User>[] = [
    // HIGH PRIORITY
    {
      key: 'user',
      label: 'User',
      priority: 'high',
      render: (user) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{user.email}</div>
          {user.profile && (
            <div className="text-xs text-gray-500 mt-1">
              {user.profile.name || 'No name'} • {user.profile.age || 0} yrs • {user.profile.city || 'No city'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (user) => getRoleBadge(user.role)
    },
    {
      key: 'badges',
      label: 'Status',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.profile?.isVerified && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              ✓ Verified
            </span>
          )}
          {user.profile?.isOnline && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              ● Online
            </span>
          )}
          {user.profile && (
            <span className="text-xs text-gray-600">
              ⭐ {(user.profile.rating || 0).toFixed(1)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      mobileLabel: '',
      priority: 'high',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Link
            href={`/admin/profiles/${user.id}`}
            className="text-pink-600 hover:text-pink-900 text-sm font-semibold"
          >
            View
          </Link>
          {user.profile && (
            <button
              onClick={() => handleDeleteProfile(user.profile!.id)}
              disabled={deleting === user.profile.id}
              className="text-orange-600 hover:text-orange-900 text-xs font-medium disabled:opacity-50"
            >
              {deleting === user.profile.id ? 'Deleting...' : 'Del Profile'}
            </button>
          )}
        </div>
      )
    },
    // MEDIUM PRIORITY
    {
      key: 'created',
      label: 'Joined',
      mobileLabel: 'Joined Date',
      priority: 'medium',
      className: 'whitespace-nowrap',
      render: (user) => <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
    },
    // LOW PRIORITY
    {
      key: 'deleteUser',
      label: 'Delete User',
      mobileLabel: 'Delete',
      priority: 'low',
      className: 'whitespace-nowrap',
      render: (user) => (
        <button
          onClick={() => handleDeleteUser(user.id)}
          disabled={deletingUser === user.id}
          className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
        >
          {deletingUser === user.id ? 'Deleting...' : 'Delete User'}
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Users & Profiles</h1>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-3 py-2 text-sm sm:px-4 rounded-lg hover:bg-gray-700 text-center"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({users.length})
          </h2>
        </div>
        <div className="p-4">
          <ResponsiveTable
            data={users}
            columns={columns}
            keyExtractor={(user) => user.id}
            emptyMessage="No users found"
          />
        </div>
      </div>
    </div>
  );
} 