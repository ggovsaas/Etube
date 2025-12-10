'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminRole {
  id: string;
  name: string;
  canEditProfiles: boolean;
  canResolveContests: boolean;
  canAccessPayouts: boolean;
  canManageUsers: boolean;
  countryScope: string | null;
  users?: { id: string; email: string }[];
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    canEditProfiles: false,
    canResolveContests: false,
    canAccessPayouts: false,
    canManageUsers: false,
    countryScope: '',
  });

  useEffect(() => {
    // Fetch permissions first
    fetch('/api/admin/permissions')
      .then(res => res.json())
      .then(data => {
        setPermissions(data);
        if (data.canManageRoles) {
          fetchRoles();
        } else {
          setLoading(false);
          setError('Access Denied: Only Master Admins can manage roles and permissions.');
        }
      })
      .catch(err => {
        console.error('Error fetching permissions:', err);
        setError('Error loading permissions');
        setLoading(false);
      });
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/roles');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch roles (${response.status})`);
      }
      
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      canEditProfiles: false,
      canResolveContests: false,
      canAccessPayouts: false,
      canManageUsers: false,
      countryScope: '',
    });
    setShowCreateModal(true);
  };

  const handleEditRole = (role: AdminRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      canEditProfiles: role.canEditProfiles,
      canResolveContests: role.canResolveContests,
      canAccessPayouts: role.canAccessPayouts,
      canManageUsers: role.canManageUsers,
      countryScope: role.countryScope || '',
    });
    setShowCreateModal(true);
  };

  const handleSaveRole = async () => {
    try {
      const url = editingRole 
        ? `/api/admin/roles/${editingRole.id}`
        : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          countryScope: formData.countryScope || null,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchRoles();
        alert(editingRole ? 'Role updated successfully!' : 'Role created successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to save role'}`);
      }
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Error saving role.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  if (!permissions?.canManageRoles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions (RBAC)</h1>
          <Link
            href="/admin" 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            Only Master Admins can manage roles and permissions. Standard Admins do not have access to this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions (RBAC)</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateRole}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Create Role
          </button>
          <Link
            href="/admin" 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Roles ({roles.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {role.canEditProfiles && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Edit Profiles</span>
                      )}
                      {role.canResolveContests && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Resolve Contests</span>
                      )}
                      {role.canAccessPayouts && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Access Payouts</span>
                      )}
                      {role.canManageUsers && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Manage Users</span>
                      )}
                      {!role.canEditProfiles && !role.canResolveContests && !role.canAccessPayouts && !role.canManageUsers && (
                        <span className="text-xs text-gray-400">No permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.countryScope || 'GLOBAL'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.users?.length || 0} users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-pink-600 hover:text-pink-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No roles found. Create your first role to get started.</div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., MODERATOR, GERMANY_ADMIN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Scope (leave empty for GLOBAL)
                </label>
                <input
                  type="text"
                  value={formData.countryScope}
                  onChange={(e) => setFormData({ ...formData, countryScope: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., Germany, Brazil, or leave empty"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.canEditProfiles}
                    onChange={(e) => setFormData({ ...formData, canEditProfiles: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Can Edit Profiles</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.canResolveContests}
                    onChange={(e) => setFormData({ ...formData, canResolveContests: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Can Resolve Contests</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.canAccessPayouts}
                    onChange={(e) => setFormData({ ...formData, canAccessPayouts: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Can Access Payouts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.canManageUsers}
                    onChange={(e) => setFormData({ ...formData, canManageUsers: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Can Manage Users</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

