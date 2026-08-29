import React from 'react';
import { useLivePresence } from '../hooks/useLivePresence';

export const LiveVisitorsBadge: React.FC = () => {
  const { visitorCount, isLoaded } = useLivePresence();

  if (!isLoaded || visitorCount === null) {
    return (
      <div className="px-3 py-1.5 sm:py-2 rounded-xl bg-surface-850 border border-surface-700 text-slate-400 text-xs whitespace-nowrap flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  const renderText = () => {
    if (visitorCount <= 1) {
      return <span>Listening solo</span>;
    }
    return (
      <span>
        <strong className="text-accent-400 font-semibold">{visitorCount}</strong> listening now
      </span>
    );
  };

  return (
    <div
      title="Live concurrent listeners"
      className="px-3 py-1.5 sm:py-2 rounded-xl bg-surface-850 border border-surface-700 text-slate-300 text-xs whitespace-nowrap flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />
      {renderText()}
    </div>
  );
};
