import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  // FIX: Changed "aria-hidden" value from string "true" to boolean true to satisfy React's `Booleanish` type.
  "aria-hidden": true,
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 2,
};

export const JournalIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h18" />
  </svg>
);

export const ChartBarIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5v6a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75v12" />
    <path strokeLinecap="round" strokeLinejoin="round"d="M8.25 9.75v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5v8.25" />
  </svg>
);

export const CogIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-6.75 3.75h9.75m-9.75 3.75h9.75m-4.5 3.75h1.5m-6.75 3.75h9.75M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const ArrowLeftIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export const ArrowRightIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const PencilIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const TrashIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const PlusIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export const PlusCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ChartPieIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

export const CalendarWeekIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h.01" />
  </svg>
);

export const SunIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const SparklesIcon: React.FC = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M5 17v4m-2-2h4m10-14l1.414 1.414M19 5l-1.414 1.414M19 19l-1.414-1.414M12 21a9 9 0 110-18 9 9 0 010 18zm-3-3a1 1 0 001 1h4a1 1 0 001-1v-1a1 1 0 00-1-1h-.5a.5.5 0 01-.5-.5V12a.5.5 0 01.5-.5H14a1 1 0 001-1V9a1 1 0 00-1-1h-4a1 1 0 00-1 1v1a1 1 0 001 1h.5a.5.5 0 01.5.5V15a.5.5 0 01-.5.5H9a1 1 0 00-1 1v1z" />
  </svg>
);