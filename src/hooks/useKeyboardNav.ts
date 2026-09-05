import { useEffect } from 'react';

interface UseKeyboardNavOptions {
  isEnabled?: boolean;
  onToggleShortcuts?: () => void;
}

/**
 * Global keyboard navigation hook for the public directory.
 * - `Space`: Play/pause (launches) the currently focused station
 * - `→` (ArrowRight): Next station card in catalog
 * - `←` (ArrowLeft): Previous station card in catalog
 * - `/`: Focuses global search input
 * - `?`: Toggles keyboard shortcuts modal guide
 * - `Escape`: Blurs search / clears active card focus
 *
 * Strict Guards:
 * - Never intercepts keys when user is typing in search, form inputs, textareas, or modals.
 * - Calls `preventDefault()` ONLY when a shortcut actively fires.
 */
export function useKeyboardNav(
  isEnabledOrOptions: boolean | UseKeyboardNavOptions = true,
  legacyOnToggleShortcuts?: () => void
) {
  const isEnabled =
    typeof isEnabledOrOptions === 'boolean'
      ? isEnabledOrOptions
      : isEnabledOrOptions.isEnabled ?? true;

  const onToggleShortcuts =
    typeof isEnabledOrOptions === 'object'
      ? isEnabledOrOptions.onToggleShortcuts
      : legacyOnToggleShortcuts;

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modified keys (Ctrl, Cmd, Alt) except Shift for '?'
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const activeElement = document.activeElement as HTMLElement | null;
      const target = (e.target || activeElement) as HTMLElement | null;

      // Check if user is typing or interacting with an editable element
      const isInsideInput = Boolean(
        activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable)
      ) || Boolean(
        target?.closest('input, textarea, select, [contenteditable="true"]')
      );

      // Check if user is inside a modal or dialog
      const isInsideModal = Boolean(
        target?.closest('[role="dialog"], [role="modal"]')
      );

      // If typing or inside modal form, protect all normal typing behavior
      if (isInsideInput || isInsideModal) {
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
        // Do NOT intercept any other key (Space, arrows, etc.) while typing
        return;
      }

      // 1. "/" focuses search input
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 2. "?" toggles shortcuts modal
      if (e.key === '?' && onToggleShortcuts) {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      // 3. Card Arrow Navigation & Space Play/Pause
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-station-card]'));
      if (cards.length === 0) return;

      const currentCardIndex = activeElement
        ? cards.findIndex((card) => card === activeElement || card.contains(activeElement))
        : -1;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = currentCardIndex >= 0 ? (currentCardIndex + 1) % cards.length : 0;
        const targetCard = cards[nextIndex];
        targetCard?.focus();
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex =
          currentCardIndex > 0 ? currentCardIndex - 1 : cards.length - 1;
        const targetCard = cards[prevIndex];
        targetCard?.focus();
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (e.key === ' ') {
        // Space only triggers play/pause if a station card is actively focused
        if (currentCardIndex >= 0) {
          e.preventDefault();
          cards[currentCardIndex]?.click();
        }
        // If NO card is focused, preventDefault is NOT called — standard page scrolling is preserved!
      } else if (e.key === 'Escape' && currentCardIndex >= 0) {
        activeElement?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, onToggleShortcuts]);
}
