'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
  isClient?: boolean;
  isContentCreator?: boolean;
  isServiceProvider?: boolean;
  createdAt: string;
  profile?: {
    id: string;
    name: string;
    age: number;
    city: string;
  };
  _count?: {
    listings: number;
    reviews: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

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

  const handleToggleRole = async (userId: string, roleFlag: 'isClient' | 'isContentCreator' | 'isServiceProvider', currentValue: boolean) => {
    setTogglingRole(`${userId}-${roleFlag}`);
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleFlag,
          value: !currentValue,
        }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`Role flag ${roleFlag} ${!currentValue ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to toggle role flag'}`);
      }
    } catch (err) {
      console.error('Error toggling role flag:', err);
      alert('Error toggling role flag.');
    } finally {
      setTogglingRole(null);
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
      USER: 'bg-blue-100 text-blue-800',
      CAM_CREATOR: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Accounts Management</h1>
        <Link
          href="/admin" 
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="ESCORT">Escort</option>
              <option value="USER">User</option>
              <option value="CAM_CREATOR">Cam Creator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email || 'No email'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${user.isClient ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                          Client
                        </span>
                        <button
                          onClick={() => handleToggleRole(user.id, 'isClient', user.isClient || false)}
                          disabled={togglingRole === `${user.id}-isClient`}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          title="Toggle Client role"
                        >
                          {user.isClient ? '✓' : '○'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${user.isContentCreator ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-400'}`}>
                          Content Creator
                        </span>
                        <button
                          onClick={() => handleToggleRole(user.id, 'isContentCreator', user.isContentCreator || false)}
                          disabled={togglingRole === `${user.id}-isContentCreator`}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          title="Toggle Content Creator role"
                        >
                          {user.isContentCreator ? '✓' : '○'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${user.isServiceProvider ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                          Service Provider
                        </span>
                        <button
                          onClick={() => handleToggleRole(user.id, 'isServiceProvider', user.isServiceProvider || false)}
                          disabled={togglingRole === `${user.id}-isServiceProvider`}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          title="Toggle Service Provider role"
                        >
                          {user.isServiceProvider ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.profile ? (
                      <div className="text-sm text-gray-900">
                        {user.profile.name || 'No name'}
                        {user.profile.city && (
                          <div className="text-xs text-gray-500">{user.profile.city}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No profile</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user._count?.listings || 0} listings
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/profiles/${user.id}`}
                        className="text-pink-600 hover:text-pink-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingUser === user.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingUser === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No users found</div>
          </div>
        )}
      </div>
    </div>
  );
}

