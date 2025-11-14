import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${safePercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;