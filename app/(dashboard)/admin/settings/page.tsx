'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/lib/store/auth';

type AdminRole = 'RH' | 'DRH';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

interface JobPosition {
  id: string;
  name: string;
  ar_name: string;
}

interface JobPositionFormData {
  name: string;
  ar_name: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    role: 'RH',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPosition, setNewPosition] = useState<JobPositionFormData>({
    name: '',
    ar_name: '',
  });

  const { data: admins, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/users');
      return response.data;
    },
  });

  const { data: jobPositions, isLoading: jobPositionsLoading } = useQuery<JobPosition[]>({
    queryKey: ['jobPositions'],
    queryFn: async () => {
      const response = await axios.get('/api/job-positions');
      return response.data;
    },
  });

  const addPositionMutation = useMutation({
    mutationFn: async (data: JobPositionFormData) => {
      const response = await axios.post('/api/job-positions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      setNewPosition({ name: '', ar_name: '' });
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/job-positions?id=${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/admin/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'RH' });
      await queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin created successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to create admin');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdminStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`/api/admin/users/${id}`, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(`Admin ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const handleJobPositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosition.name || !newPosition.ar_name) return;
    addPositionMutation.mutate(newPosition);
  };

  const handleJobPositionDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job position?')) {
      deletePositionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Create New Admin</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="RH">RH</option>
              <option value="DRH">DRH</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Manage Admins</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {admins?.map((admin) => (
              <li key={admin.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    {admin.email !== 'contact@emsm.dz' && (
                      <p className="text-sm text-gray-500">Role: {admin.role || 'N/A'}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${admin.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                      ${admin.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : ''}
                      ${admin.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}
                    >
                      {admin.status}
                    </span>
                    {admin.status !== 'PENDING' && admin.email !== currentUser?.email && (
                      <button
                        onClick={() => toggleAdminStatus(admin.id, admin.status)}
                        className={`px-3 py-1 text-sm font-medium rounded
                          ${
                            admin.status === 'ACTIVE'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Job Positions</h2>

        <form onSubmit={handleJobPositionSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Position Name (English)
              </label>
              <input
                type="text"
                id="name"
                value={newPosition.name}
                onChange={(e) => setNewPosition((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="ar_name" className="block text-sm font-medium text-gray-700">
                Position Name (Arabic)
              </label>
              <input
                type="text"
                id="ar_name"
                value={newPosition.ar_name}
                onChange={(e) => setNewPosition((prev) => ({ ...prev, ar_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={addPositionMutation.isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {addPositionMutation.isPending ? 'Adding...' : 'Add Position'}
            </button>
          </div>
        </form>

        {jobPositionsLoading ? (
          <div>Loading job positions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position Name (English)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position Name (Arabic)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobPositions?.map((position) => (
                  <tr key={position.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.ar_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleJobPositionDelete(position.id)}
                        disabled={deletePositionMutation.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
