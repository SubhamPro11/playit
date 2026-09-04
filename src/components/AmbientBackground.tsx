import React from 'react';

/**
 * AmbientBackground component provides subtle, GPU-accelerated drifting
 * amber/orange ambient light blooms behind all interactive content.
 * Features:
 * - 0 Javascript frame loop (pure CSS compositor transforms)
 * - pointer-events-none & z-0 (never intercepts clicks or blocks UI)
 * - Automatically respects prefers-reduced-motion: reduce
 */
export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 ambient-background select-none"
    >
      {/* Top-right subtle amber bloom */}
      <div
        className="ambient-glow-1 absolute -top-32 -right-32 w-[36rem] h-[36rem] sm:w-[48rem] sm:h-[48rem] rounded-full bg-accent-500/[0.06] blur-[120px] sm:blur-[150px] transform-gpu"
      />

      {/* Bottom-left soft warm orange bloom */}
      <div
        className="ambient-glow-2 absolute -bottom-40 -left-32 w-[34rem] h-[34rem] sm:w-[44rem] sm:h-[44rem] rounded-full bg-amber-600/[0.045] blur-[110px] sm:blur-[140px] transform-gpu"
      />
    </div>
  );
};
