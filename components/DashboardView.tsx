import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getActivities, getLogsForMonth, getMockUserId } from '../services/firestoreService';
import { Activity, Log } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, ChartPieIcon } from './icons';
import ProgressBar from './ProgressBar';

interface MonthlyProgress {
  [activityId: string]: number;
}

const DashboardView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<MonthlyProgress>({});
  const [loading, setLoading] = useState(true);

  const userId = getMockUserId();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedActivities, fetchedLogs] = await Promise.all([
        getActivities(userId),
        getLogsForMonth(userId, currentYear, currentMonth)
      ]);
      setActivities(fetchedActivities);
      
      const progressData = fetchedLogs.reduce((acc, log) => {
        acc[log.activityId] = (acc[log.activityId] || 0) + log.value;
        return acc;
      }, {} as MonthlyProgress);
      setProgress(progressData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentYear, currentMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const changeMonth = (months: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + months);
      return newDate;
    });
  };

  const groupedActivities = useMemo(() => {
    return activities.reduce((acc, activity) => {
      (acc[activity.category] = acc[activity.category] || []).push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities]);

  const headerMonth = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(currentDate);

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-center text-sky-700 dark:text-sky-300">{headerMonth}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowRightIcon />
        </button>
      </div>
      
      {activities.length === 0 ? (
         <div className="text-center p-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No data to display</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add some activities and log your progress to see your dashboard.</p>
        </div>
      ) : (
        // FIX: Replaced Object.entries with Object.keys to iterate over grouped activities, resolving a type inference issue where array values were being treated as 'unknown'.
        Object.keys(groupedActivities).map(category => (
          <div key={category} className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 border-b-2 border-gray-200 dark:border-gray-700 pb-2 text-sky-600 dark:text-sky-400">{category}</h3>
            <div className="space-y-6">
              {groupedActivities[category].map(activity => {
                const actual = progress[activity.id] || 0;
                const goal = activity.goal;
                const percentage = goal > 0 ? Math.round((actual / goal) * 100) : 0;
                return (
                  <div key={activity.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-gray-800 dark:text-gray-300">{activity.name}</span>
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {actual.toLocaleString()} / {goal.toLocaleString()} {activity.unit}
                      </span>
                    </div>
                    <ProgressBar percentage={percentage} />
                    <div className="text-right text-sm text-sky-700 dark:text-sky-300 font-semibold mt-1">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardView;