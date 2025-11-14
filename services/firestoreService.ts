import { Activity, Log } from '../types';

// --- INITIAL MOCK DATA ---
const MOCK_USER_ID = 'mock-user-123';

const initialActivities: Activity[] = [
  { id: 'act1', userId: MOCK_USER_ID, name: 'Financial Accounting', category: 'Courses', goal: 36, unit: 'Hours' },
  { id: 'act2', userId: MOCK_USER_ID, name: 'Data, Models & Decisions', category: 'Courses', goal: 36, unit: 'Hours' },
  { id: 'act3', userId: MOCK_USER_ID, name: 'BCG Networking', category: 'BCG Prep', goal: 20, unit: 'Hours' },
  { id: 'act4', userId: MOCK_USER_ID, name: 'MIT Networking', category: 'MIT', goal: 1, unit: 'Hours' },
  { id: 'act5', userId: MOCK_USER_ID, name: 'Exercise', category: 'Personal', goal: 30, unit: 'Hours' },
  { id: 'act6', userId: MOCK_USER_ID, name: 'Client Mentor', category: 'MPW', goal: 30, unit: 'Hours'},
];

const initialLogs: Log[] = [
    // Simulate some logs for the current month
    ...(() => {
        const today = new Date();
        const logs: Log[] = [];
        const createLog = (activityId: string, day: number, value: number) => {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            logs.push({
                id: `log-${activityId}-${day}`,
                userId: MOCK_USER_ID,
                activityId,
                date: date.toISOString().split('T')[0],
                value,
            });
        };

        createLog('act1', 2, 1.5);
        createLog('act1', 3, 2);
        createLog('act2', 1, 3);
        createLog('act3', 5, 1);
        createLog('act5', 2, 1);
        createLog('act5', 4, 1.5);
        createLog('act5', 6, 0.5);
        createLog('act5', 8, 1); // Log for next week
        createLog('act1', 9, 2.5); // Log for next week


        return logs;
    })()
];


// --- MOCK SERVICE ---
let activities: Activity[] = [...initialActivities];
let logs: Log[] = [...initialLogs];
let nextActivityId = initialActivities.length + 1;

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 200));
}

// --- ACTIVITIES API ---
export const getActivities = (userId: string): Promise<Activity[]> => {
    return simulateDelay(activities.filter(a => a.userId === userId));
}

export const addActivity = (userId: string, data: Omit<Activity, 'id' | 'userId'>): Promise<Activity> => {
    const newActivity: Activity = {
        id: `act${nextActivityId++}`,
        userId,
        ...data,
    };
    activities.push(newActivity);
    return simulateDelay(newActivity);
}

export const updateActivity = (activityId: string, data: Partial<Activity>): Promise<Activity> => {
    let updatedActivity: Activity | null = null;
    activities = activities.map(act => {
        if (act.id === activityId) {
            updatedActivity = { ...act, ...data };
            return updatedActivity;
        }
        return act;
    });
    if (!updatedActivity) return Promise.reject(new Error("Activity not found"));
    return simulateDelay(updatedActivity);
}

export const deleteActivity = (activityId: string): Promise<void> => {
    const initialLength = activities.length;
    activities = activities.filter(act => act.id !== activityId);
    if (activities.length === initialLength) {
        return Promise.reject(new Error("Activity not found"));
    }
    // Also delete associated logs
    logs = logs.filter(log => log.activityId !== activityId);
    return simulateDelay(undefined);
}

// --- CATEGORIES API ---
export const updateCategoryName = (userId: string, oldName: string, newName: string): Promise<void> => {
    activities = activities.map(act => {
        if (act.userId === userId && act.category === oldName) {
            return { ...act, category: newName };
        }
        return act;
    });
    return simulateDelay(undefined);
}

export const removeCategory = (userId: string, categoryName: string): Promise<void> => {
    activities = activities.map(act => {
        if (act.userId === userId && act.category === categoryName) {
            // Un-assign category instead of deleting the activity
            return { ...act, category: '' };
        }
        return act;
    });
    return simulateDelay(undefined);
}


// --- LOGS API ---
export const getLogsForDate = (userId: string, date: string): Promise<Log[]> => {
    return simulateDelay(logs.filter(log => log.userId === userId && log.date === date));
}

export const getLogsForMonth = (userId: string, year: number, month: number): Promise<Log[]> => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return simulateDelay(logs.filter(log => log.userId === userId && log.date.startsWith(monthPrefix)));
}

export const getLogsForWeek = (userId: string, startDate: Date): Promise<Log[]> => {
    const startString = startDate.toISOString().split('T')[0];
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const endString = endDate.toISOString().split('T')[0];

    return simulateDelay(logs.filter(log =>
        log.userId === userId &&
        log.date >= startString &&
        log.date <= endString
    ));
}

export const upsertLog = (userId: string, activityId: string, date: string, value: number): Promise<Log> => {
    const existingLogIndex = logs.findIndex(log => log.userId === userId && log.activityId === activityId && log.date === date);

    if (existingLogIndex > -1) {
        // Update existing log
        if (value === 0 || isNaN(value)) {
            // Delete if value is 0 or invalid
            logs.splice(existingLogIndex, 1);
            return simulateDelay(null); // Indicate deletion
        }
        logs[existingLogIndex].value = value;
        return simulateDelay(logs[existingLogIndex]);
    } else {
        // Create new log if value is not 0
        if (value > 0 && !isNaN(value)) {
            const newLog: Log = {
                id: `log-${Date.now()}`,
                userId,
                activityId,
                date,
                value
            };
            logs.push(newLog);
            return simulateDelay(newLog);
        }
        return Promise.resolve(null); // No log created
    }
}

export const getMockUserId = () => MOCK_USER_ID;