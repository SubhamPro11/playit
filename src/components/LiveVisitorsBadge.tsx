import React from 'react';
import { useLivePresence } from '../hooks/useLivePresence';

export const LiveVisitorsBadge: React.FC = () => {
  const { visitorCount, isLoaded } = useLivePresence();

  if (!isLoaded || visitorCount === null) {
    return (
      <div className="px-3 py-2 rounded-xl bg-[#141418] border border-[#27272a] text-zinc-400 font-mono text-xs whitespace-nowrap shadow-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  const renderText = () => {
    if (visitorCount <= 1) {
      return <span>Just you browsing now</span>;
    }
    return (
      <span>
        <strong className="text-red-400 font-bold">{visitorCount}</strong> people browsing now
      </span>
    );
  };

  return (
    <div
      title="Live concurrent visitors"
      className="px-3.5 py-2 rounded-xl bg-[#141418] border border-[#27272a] text-zinc-300 font-mono text-xs whitespace-nowrap shadow-xs flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] shrink-0" />
      {renderText()}
    </div>
  );
};
