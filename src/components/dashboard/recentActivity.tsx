import { timeAgo } from "@/src/lib/format";
import { Card } from "../card";
import { useDashboardData } from ".";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Response from "@/src/components/response";

export default function RecentActivity() {
  const data = useDashboardData();

  if (!data) {
    return (
      <Card>
        <Response
          type="error"
          message="Failed to load recent activity. Please try again later."
        />
      </Card>
    );
  }

  const recentActivity = data?.recentActivity.slice(0, 5) ?? [];
  return (
    <Card>
      <h1 className="font-semibold text-xl text-gray-900 dark:text-white">
        Recent Activity
      </h1>
      {recentActivity.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
          No recent activity
        </p>
      ) : (
        <ul>
          {recentActivity.map((activity) => (
            <li key={activity.id} className="flex items-center gap-4 py-2">
              {activity.type === "incoming" ? (
                <FaArrowDown className="inline-block text-3xl text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-2 rounded" />
              ) : (
                <FaArrowUp className="inline-block text-3xl text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 p-2 rounded" />
              )}
              <div>
                <div className="flex gap-1">
                  <h1 className="font-semibold text-gray-900 dark:text-white">
                    {activity.products?.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activity.units} Units
                  </p>
                </div>
                <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>{activity.users?.username}</p>•
                  <p>{timeAgo(activity.created_at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
