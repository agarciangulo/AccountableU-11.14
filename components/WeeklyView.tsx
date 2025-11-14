import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getActivities, getLogsForWeek, getMockUserId } from '../services/firestoreService';
import { Activity, Log } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, CalendarWeekIcon } from './icons';

interface WeeklyData {
  [activityId: string]: {
    activity: Activity;
    dailyValues: number[]; // 7 days, 0 for Sunday
    total: number;
  };
}

const WeeklyView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = getMockUserId();

  // Helper to get the start of the week (Sunday)
  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = date.getDate() - day;
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedActivities, fetchedLogs] = await Promise.all([
        getActivities(userId),
        getLogsForWeek(userId, weekStart)
      ]);
      setActivities(fetchedActivities);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to fetch weekly data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, weekStart]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  const changeWeek = (weeks: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (weeks * 7));
      return newDate;
    });
  };
  
  const processedData = useMemo(() => {
    const data: WeeklyData = {};
    activities.forEach(act => {
      data[act.id] = {
        activity: act,
        dailyValues: Array(7).fill(0),
        total: 0,
      };
    });

    logs.forEach(log => {
      if (data[log.activityId]) {
        const logDate = new Date(log.date + 'T00:00:00'); // Ensure local timezone
        const dayOfWeek = logDate.getDay(); // Sunday = 0
        data[log.activityId].dailyValues[dayOfWeek] += log.value;
        data[log.activityId].total += log.value;
      }
    });
    
    // Group by category
    return Object.values(data).reduce((acc, item) => {
      const category = item.activity.category;
      (acc[category] = acc[category] || []).push(item);
      return acc;
    }, {} as Record<string, (typeof data)[string][]>);
  }, [activities, logs]);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const headerDate = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="text-center p-8">Loading weekly view...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-center text-sky-700 dark:text-sky-300">{headerDate}</h2>
        <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowRightIcon />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <CalendarWeekIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add some activities to see your weekly progress.</p>
        </div>
      ) : (
        // FIX: Replaced Object.entries with Object.keys to iterate over processed data, resolving a type inference issue where array values were being treated as 'unknown'.
        Object.keys(processedData).map(category => (
          <div key={category} className="bg-white dark:bg-gray-800/50 p-0 sm:p-2 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 border-b-2 border-gray-200 dark:border-gray-700 pb-2 text-sky-600 dark:text-sky-400 px-4 pt-4 sm:px-2 sm:pt-2">{category}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-100 dark:bg-gray-800">Activity</th>
                    {weekDays.map(day => <th key={day} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">{day}</th>)}
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                  {processedData[category].map(({ activity, dailyValues, total }) => (
                    <tr key={activity.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">{activity.name}</td>
                      {dailyValues.map((value, i) => (
                        <td key={i} className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300 font-mono">
                          {value > 0 ? value.toLocaleString() : '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-sky-700 dark:text-sky-300 font-bold">{total.toLocaleString()} {activity.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WeeklyView;