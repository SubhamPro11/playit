import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 400px (roughly one viewport height on mobile)
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-surface-900/90 hover:bg-surface-850 text-accent-400 hover:text-white border border-surface-700 hover:border-accent-500/50 shadow-2xl backdrop-blur-md transition-all duration-200 hover:-translate-y-1 focus:outline-hidden focus:ring-2 focus:ring-accent-500 cursor-pointer group animate-in fade-in zoom-in-90"
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};
