import { useEffect } from 'react';

/**
 * Global keyboard navigation hook for the public directory.
 * - `/` focuses search input
 * - Arrow keys (Up, Down, Left, Right) navigate across station cards
 * - Enter / Space activates the focused station link
 * - Escape blurs search / clears active card focus
 */
export function useKeyboardNav(isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isTyping =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable);

      // 1. "/" to focus search input
      if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // If typing in search or other input, only handle Escape or ArrowDown to enter card list
      if (isTyping) {
        if (e.key === 'Escape') {
          activeElement?.blur();
        } else if (e.key === 'ArrowDown' && activeElement?.id === 'global-search-input') {
          const firstCard = document.querySelector<HTMLElement>('[data-station-card]');
          if (firstCard) {
            e.preventDefault();
            firstCard.focus();
            firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
        return;
      }

      // 2. Card Arrow Navigation & Activation
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-station-card]'));
      if (cards.length === 0) return;

      const currentCardIndex = activeElement
        ? cards.findIndex((card) => card === activeElement || card.contains(activeElement))
        : -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentCardIndex >= 0 ? (currentCardIndex + 1) % cards.length : 0;
        const target = cards[nextIndex];
        target?.focus();
        target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex =
          currentCardIndex > 0 ? currentCardIndex - 1 : cards.length - 1;
        const target = cards[prevIndex];
        target?.focus();
        target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (e.key === ' ' && currentCardIndex >= 0) {
        // Space to activate focused card
        e.preventDefault();
        cards[currentCardIndex]?.click();
      } else if (e.key === 'Home' && currentCardIndex >= 0) {
        e.preventDefault();
        cards[0]?.focus();
        cards[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (e.key === 'End' && currentCardIndex >= 0) {
        e.preventDefault();
        cards[cards.length - 1]?.focus();
        cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);
}
