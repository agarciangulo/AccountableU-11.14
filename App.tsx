import React, { useState } from 'react';
import DailyLogView from './components/DailyLogView';
import DashboardView from './components/DashboardView';
import ManageActivitiesView from './components/ManageActivitiesView';
import WeeklyView from './components/WeeklyView';
import AIDiaryView from './components/AIDiaryView';
import { JournalIcon, ChartBarIcon, CogIcon, CalendarWeekIcon, SparklesIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';

type View = 'log' | 'weekly' | 'dashboard' | 'manage' | 'ai';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('log');

  const renderView = () => {
    switch (currentView) {
      case 'log':
        return <DailyLogView />;
      case 'weekly':
        return <WeeklyView />;
      case 'dashboard':
        return <DashboardView />;
      case 'manage':
        return <ManageActivitiesView />;
      case 'ai':
        return <AIDiaryView />;
      default:
        return <DailyLogView />;
    }
  };

  const NavItem: React.FC<{
    viewName: View;
    icon: React.ReactNode;
    label: string;
  }> = ({ viewName, icon, label }) => (
    <button
      onClick={() => setCurrentView(viewName)}
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-3 text-sm font-medium transition-colors duration-200 ${
        currentView === viewName
          ? 'text-sky-600 dark:text-sky-400 bg-gray-100 dark:bg-gray-800'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="mt-1 sm:mt-0 sm:ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Accountable<span className="text-sky-600 dark:text-sky-400">U</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Personal Accountability Tracker</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <nav className="sticky bottom-0 z-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:rounded-t-lg shadow-lg">
        <div className="max-w-lg mx-auto flex">
          <NavItem viewName="log" icon={<JournalIcon />} label="Daily Log" />
          <NavItem viewName="ai" icon={<SparklesIcon />} label="AI Diary" />
          <NavItem viewName="weekly" icon={<CalendarWeekIcon />} label="Weekly" />
          <NavItem viewName="dashboard" icon={<ChartBarIcon />} label="Dashboard" />
          <NavItem viewName="manage" icon={<CogIcon />} label="Activities" />
        </div>
      </nav>
    </div>
  );
};

export default App;