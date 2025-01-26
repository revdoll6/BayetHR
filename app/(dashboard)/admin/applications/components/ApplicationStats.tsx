import Link from 'next/link';
import { FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

interface ApplicationStatsProps {
  pendingCount: number;
  acceptedCount: number;
  reviewingCount: number;
}

export default function ApplicationStats({
  pendingCount,
  acceptedCount,
  reviewingCount,
}: ApplicationStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
      {/* Pending Applications Card */}
      <Link
        href="/admin/applications?status=PENDING"
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
      >
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
                <dd>
                  <div className="text-lg font-medium text-gray-900">{pendingCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-blue-700 hover:text-blue-900">
              Review pending
            </span>
          </div>
        </div>
      </Link>

      {/* Reviewing Applications Card */}
      <Link
        href="/admin/applications?status=REVIEWING"
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiRefreshCw className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Under Review
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{reviewingCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-blue-700 hover:text-blue-900">
              View applications under review
            </span>
          </div>
        </div>
      </Link>

      {/* Accepted Applications Card */}
      <Link
        href="/admin/applications?status=ACCEPTED"
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
      >
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
                <dd>
                  <div className="text-lg font-medium text-gray-900">{acceptedCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-blue-700 hover:text-blue-900">
              View accepted
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
} 