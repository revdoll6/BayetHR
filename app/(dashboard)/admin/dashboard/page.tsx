'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalAdmins: number;
  recentApplications: Array<{
    id: string;
    candidateName: string;
    mobile: string;
    email: string;
    domain: string;
    status: string;
    createdAt: string;
  }>;
  reviewingApplications: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/dashboard');
      return response.data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <FiClock className="w-4 h-4" />;
      case 'REVIEWING':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'ACCEPTED':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'REVIEWING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiBriefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalApplications || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/applications"
              className="text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pendingApplications || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/applications?status=PENDING"
              className="text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              Review pending
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiRefreshCw className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reviewing Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.reviewingApplications || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/applications?status=REVIEWING"
              className="text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              View under review
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Accepted Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.acceptedApplications || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/applications?status=ACCEPTED"
              className="text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              View accepted
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Admins</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.totalAdmins || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/settings"
              className="text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              Manage admins
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Applications</h3>
            <Link
              href="/admin/applications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all applications
            </Link>
          </div>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats?.recentApplications?.map((application) => (
                  <li key={application.id} className="py-5">
                    <div className="flex flex-col space-y-4 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <FiUsers className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.candidateName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <FiMail className="w-4 h-4 mr-1.5" />
                                {application.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiPhone className="w-4 h-4 mr-1.5" />
                                {application.mobile}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`inline-flex items-center px-2.5 py-1.5 border rounded-full text-xs font-medium ${getStatusStyle(application.status)}`}
                        >
                          {getStatusIcon(application.status)}
                          <span className="ml-1.5">{application.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiBriefcase className="w-4 h-4 mr-1.5" />
                          {application.domain}
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1.5" />
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
