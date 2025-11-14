import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getActivities, getLogsForDate, upsertLog, getMockUserId } from '../services/firestoreService';
import { Activity, Log } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { ArrowLeftIcon, ArrowRightIcon, PlusCircleIcon } from './icons';

interface LogInputValue {
  [activityId: string]: string;
}

const DailyLogView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [inputValues, setInputValues] = useState<LogInputValue>({});
  const [loading, setLoading] = useState(true);

  const debouncedInputValues = useDebounce(inputValues, 700);
  const userId = getMockUserId();
  const dateString = currentDate.toISOString().split('T')[0];

  const fetchActivities = useCallback(() => {
    setLoading(true);
    getActivities(userId)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const fetchLogs = useCallback(() => {
    getLogsForDate(userId, dateString)
      .then(fetchedLogs => {
        setLogs(fetchedLogs);
        const initialInputs = fetchedLogs.reduce((acc, log) => {
          acc[log.activityId] = String(log.value);
          return acc;
        }, {} as LogInputValue);
        setInputValues(initialInputs);
      })
      .catch(console.error);
  }, [userId, dateString]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchLogs();
  }, [dateString, fetchLogs]);

  useEffect(() => {
    // This effect handles the debounced auto-saving
    Object.keys(debouncedInputValues).forEach(activityId => {
      const value = parseFloat(debouncedInputValues[activityId]);
      const existingLog = logs.find(log => log.activityId === activityId);

      // Only save if the value has changed
      if (!existingLog || existingLog.value !== value) {
        upsertLog(userId, activityId, dateString, isNaN(value) ? 0 : value).catch(console.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValues, dateString, userId]);

  const handleInputChange = (activityId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [activityId]: value }));
  };

  const changeDate = (days: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const groupedActivities = useMemo(() => {
    return activities.reduce((acc, activity) => {
      (acc[activity.category] = acc[activity.category] || []).push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities]);

  const headerDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentDate);

  if (loading) {
    return <div className="text-center p-8">Loading activities...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-center text-sky-700 dark:text-sky-300">{headerDate}</h2>
        <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <ArrowRightIcon />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Go to the 'Activities' tab to add your first one!</p>
        </div>
      ) : (
        // FIX: Replaced Object.entries with Object.keys to iterate over grouped activities, resolving a type inference issue where array values were being treated as 'unknown'.
        Object.keys(groupedActivities).map(category => (
          <div key={category} className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 border-b-2 border-gray-200 dark:border-gray-700 pb-2 text-sky-600 dark:text-sky-400">{category}</h3>
            <div className="space-y-4">
              {groupedActivities[category].map(activity => (
                <div key={activity.id} className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor={`log-${activity.id}`} className="col-span-2 text-gray-700 dark:text-gray-300 truncate">
                    {activity.name}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      id={`log-${activity.id}`}
                      value={inputValues[activity.id] || ''}
                      onChange={e => handleInputChange(activity.id, e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                      step="0.1"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:inline">{activity.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DailyLogView;