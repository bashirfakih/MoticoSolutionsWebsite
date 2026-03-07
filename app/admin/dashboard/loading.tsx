/**
 * Dashboard Loading Skeleton
 *
 * Shown instantly during navigation while the dashboard page loads.
 * Mirrors the layout of the actual dashboard for minimal layout shift.
 */

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-80 bg-gray-200 rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Actionable Widgets Row (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-[120px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="w-12 h-5 rounded-full bg-gray-200" />
            </div>
            <div className="h-8 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Stats Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[130px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div className="w-16 h-5 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders skeleton */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pending Actions skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="h-6 w-36 bg-gray-200 rounded" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-gray-200">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-48 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
