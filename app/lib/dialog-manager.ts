/**
 * Dialog Manager
 * Centralized management for all application dialogs
 * Ensures consistent behavior and proper cleanup
 */

type DialogCallback = (result?: any) => void;

interface DialogState {
  [key: string]: {
    isOpen: boolean;
    data?: any;
  };
}

class DialogManager {
  private dialogStates: DialogState = {};
  private callbacks: Map<string, DialogCallback[]> = new Map();

  /**
   * Register a dialog
   */
  register(dialogId: string, initialState = false) {
    this.dialogStates[dialogId] = {
      isOpen: initialState,
    };
    this.callbacks.set(dialogId, []);
  }

  /**
   * Open dialog
   */
  open(dialogId: string, data?: any) {
    if (!this.dialogStates[dialogId]) {
      this.register(dialogId);
    }

    this.dialogStates[dialogId] = {
      isOpen: true,
      data,
    };

    console.log(`[DialogManager] Opened: ${dialogId}`, data);
  }

  /**
   * Close dialog
   */
  close(dialogId: string, result?: any) {
    if (this.dialogStates[dialogId]) {
      this.dialogStates[dialogId].isOpen = false;
      this.executeCallbacks(dialogId, result);
    }

    console.log(`[DialogManager] Closed: ${dialogId}`);
  }

  /**
   * Get dialog state
   */
  getState(dialogId: string) {
    return this.dialogStates[dialogId] || { isOpen: false };
  }

  /**
   * Check if dialog is open
   */
  isOpen(dialogId: string): boolean {
    return this.dialogStates[dialogId]?.isOpen || false;
  }

  /**
   * Register callback for dialog
   */
  onClose(dialogId: string, callback: DialogCallback) {
    if (!this.callbacks.has(dialogId)) {
      this.callbacks.set(dialogId, []);
    }
    this.callbacks.get(dialogId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(dialogId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Execute all callbacks for dialog
   */
  private executeCallbacks(dialogId: string, result?: any) {
    const callbacks = this.callbacks.get(dialogId) || [];
    callbacks.forEach((callback) => callback(result));
  }

  /**
   * Clear all dialogs
   */
  clear() {
    this.dialogStates = {};
    this.callbacks.clear();
  }

  /**
   * Get all open dialogs
   */
  getOpenDialogs(): string[] {
    return Object.entries(this.dialogStates)
      .filter(([_, state]) => state.isOpen)
      .map(([id]) => id);
  }

  /**
   * Close all dialogs
   */
  closeAll() {
    Object.keys(this.dialogStates).forEach((dialogId) => {
      this.close(dialogId);
    });
  }
}

// Export singleton instance
export const dialogManager = new DialogManager();

/**
 * Hook for managing dialog state
 * Usage: const { isOpen, open, close } = useDialog('dialog-id');
 */
export function useDialog(dialogId: string) {
  const open = (data?: any) => dialogManager.open(dialogId, data);
  const close = (result?: any) => dialogManager.close(dialogId, result);
  const isOpen = () => dialogManager.isOpen(dialogId);
  const getState = () => dialogManager.getState(dialogId);
  const onClose = (callback: DialogCallback) =>
    dialogManager.onClose(dialogId, callback);

  return {
    isOpen,
    open,
    close,
    getState,
    onClose,
  };
}

/**
 * Hook for managing multiple dialogs
 */
export function useDialogs(dialogIds: string[]) {
  const dialogs = dialogIds.reduce(
    (acc, id) => {
      acc[id] = useDialog(id);
      return acc;
    },
    {} as Record<string, ReturnType<typeof useDialog>>
  );

  return {
    dialogs,
    closeAll: () => dialogManager.closeAll(),
    getOpenDialogs: () => dialogManager.getOpenDialogs(),
  };
}
