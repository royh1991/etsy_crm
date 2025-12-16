import { useEffect, useCallback } from 'react';
import { useOrderStore } from '../stores/orderStore';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const {
    orders,
    selectedOrderId,
    setActiveView,
    openOrderDrawer,
    closeOrderDrawer,
    openShippingModal,
    moveOrder,
    isOrderDrawerOpen
  } = useOrderStore();

  // Get current order index
  const getSelectedOrderIndex = useCallback(() => {
    if (!selectedOrderId) return -1;
    return orders.findIndex(o => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  // Select next/previous order
  const selectNextOrder = useCallback(() => {
    const currentIndex = getSelectedOrderIndex();
    const nextIndex = currentIndex < orders.length - 1 ? currentIndex + 1 : 0;
    if (orders[nextIndex]) {
      openOrderDrawer(orders[nextIndex].id);
    }
  }, [orders, getSelectedOrderIndex, openOrderDrawer]);

  const selectPrevOrder = useCallback(() => {
    const currentIndex = getSelectedOrderIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : orders.length - 1;
    if (orders[prevIndex]) {
      openOrderDrawer(orders[prevIndex].id);
    }
  }, [orders, getSelectedOrderIndex, openOrderDrawer]);

  // Move order to stage by number
  const moveToStage = useCallback((stageIndex: number) => {
    if (!selectedOrderId) return;
    const stages = ['new', 'processing', 'ready-to-ship', 'shipped', 'delivered', 'needs-attention'] as const;
    if (stageIndex >= 0 && stageIndex < stages.length) {
      moveOrder(selectedOrderId, stages[stageIndex]);
    }
  }, [selectedOrderId, moveOrder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape to close modals even from inputs
        if (e.key !== 'Escape') return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      // Command palette: Cmd/Ctrl + K
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        // Dispatch custom event to open command palette
        window.dispatchEvent(new CustomEvent('toggle-command-palette'));
        return;
      }

      // Global search: /
      if (e.key === '/' && !isMeta) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-search'));
        return;
      }

      // View navigation: G then key
      if (e.key === 'g' && !isMeta && !isOrderDrawerOpen) {
        // Wait for next key
        const handleNextKey = (e2: KeyboardEvent) => {
          e2.preventDefault();
          if (e2.key === 'p') setActiveView('pipeline');
          else if (e2.key === 'c') setActiveView('customers');
          else if (e2.key === 'd' || e2.key === 'a') setActiveView('analytics');
          window.removeEventListener('keydown', handleNextKey);
        };
        window.addEventListener('keydown', handleNextKey, { once: true });
        return;
      }

      // Quick view switching (without G prefix)
      if (!isOrderDrawerOpen && !isMeta) {
        if (e.key === 'p') {
          e.preventDefault();
          setActiveView('pipeline');
          return;
        }
        if (e.key === 'c') {
          e.preventDefault();
          setActiveView('customers');
          return;
        }
        if (e.key === 'd') {
          e.preventDefault();
          setActiveView('analytics');
          return;
        }
      }

      // Order navigation when drawer is open
      if (isOrderDrawerOpen) {
        // Close drawer: Escape
        if (e.key === 'Escape') {
          e.preventDefault();
          closeOrderDrawer();
          return;
        }

        // Next order: J or ArrowDown
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          selectNextOrder();
          return;
        }

        // Previous order: K or ArrowUp
        if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          selectPrevOrder();
          return;
        }

        // Create shipping label: L
        if (e.key === 'l' && selectedOrderId) {
          e.preventDefault();
          closeOrderDrawer();
          openShippingModal(selectedOrderId);
          return;
        }

        // Move to stage: 1-6
        if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
          e.preventDefault();
          moveToStage(parseInt(e.key) - 1);
          return;
        }
      }

      // Sync orders: S (when not in drawer)
      if (e.key === 's' && !isMeta && !isOrderDrawerOpen) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('sync-orders'));
        return;
      }

      // New order / Quick add: N
      if (e.key === 'n' && !isMeta && !isOrderDrawerOpen) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('quick-add'));
        return;
      }

      // Show keyboard shortcuts: ?
      if (e.key === '?' && !isMeta) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('show-shortcuts'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOrderDrawerOpen,
    selectedOrderId,
    setActiveView,
    closeOrderDrawer,
    selectNextOrder,
    selectPrevOrder,
    moveToStage,
    openShippingModal
  ]);
}

// Export shortcuts list for help modal
export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['P'], description: 'Go to Pipeline view' },
  { keys: ['C'], description: 'Go to Customers view' },
  { keys: ['D'], description: 'Go to Dashboard' },
  { keys: ['S'], description: 'Sync orders from Etsy' },
  { keys: ['N'], description: 'Quick add / New' },
  { keys: ['Esc'], description: 'Close drawer/modal' },
  { keys: ['J', '↓'], description: 'Next order' },
  { keys: ['K', '↑'], description: 'Previous order' },
  { keys: ['L'], description: 'Create shipping label' },
  { keys: ['1-6'], description: 'Move to stage 1-6' }
];
