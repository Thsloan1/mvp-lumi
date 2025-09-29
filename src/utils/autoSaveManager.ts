import { safeLocalStorageGet, safeLocalStorageSet } from './jsonUtils';

export interface AutoSaveData {
  id: string;
  data: any;
  timestamp: Date;
  step?: number;
  userId?: string;
}

export class AutoSaveManager {
  private static readonly SAVE_DELAY = 500; // 500ms debounce
  private static saveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Auto-save with debouncing
  static autoSave(key: string, data: any, options?: { step?: number; userId?: string }) {
    // Clear existing timeout for this key
    const existingTimeout = this.saveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      try {
        const saveData: AutoSaveData = {
          id: key,
          data,
          timestamp: new Date(),
          step: options?.step,
          userId: options?.userId
        };
        
        safeLocalStorageSet(key, saveData);
        
        // Optional: Show subtle save indicator
        this.showSaveIndicator();
      } catch (error) {
        console.warn(`Failed to auto-save ${key}:`, error);
      }
      
      this.saveTimeouts.delete(key);
    }, this.SAVE_DELAY);

    this.saveTimeouts.set(key, timeoutId);
  }

  // Load saved data
  static loadSaved<T>(key: string, defaultValue: T): T {
    try {
      const savedData = safeLocalStorageGet(key, null);
      if (savedData && savedData.data) {
        return savedData.data;
      }
    } catch (error) {
      console.warn(`Failed to load saved data for ${key}:`, error);
    }
    return defaultValue;
  }

  // Clear saved data
  static clearSaved(key: string) {
    try {
      localStorage.removeItem(key);
      
      // Clear any pending save timeout
      const timeout = this.saveTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.saveTimeouts.delete(key);
      }
    } catch (error) {
      console.warn(`Failed to clear saved data for ${key}:`, error);
    }
  }

  // Check if there's saved progress
  static hasSavedProgress(key: string): boolean {
    try {
      const savedData = safeLocalStorageGet(key, null);
      return savedData && savedData.data && Object.keys(savedData.data).length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get save timestamp
  static getSaveTimestamp(key: string): Date | null {
    try {
      const savedData = safeLocalStorageGet(key, null);
      return savedData?.timestamp ? new Date(savedData.timestamp) : null;
    } catch (error) {
      return null;
    }
  }

  // Show subtle save indicator (optional visual feedback)
  private static showSaveIndicator() {
    // Create temporary save indicator
    const indicator = document.createElement('div');
    indicator.textContent = '✓ Saved';
    indicator.className = 'fixed top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium z-50 transition-opacity duration-300';
    
    document.body.appendChild(indicator);
    
    // Fade out and remove after 2 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(indicator);
      }, 300);
    }, 2000);
  }

  // Cleanup all timeouts (call on app unmount)
  static cleanup() {
    this.saveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.saveTimeouts.clear();
  }
}

// Auto-save hook for React components
export const useAutoSave = (key: string, data: any, options?: { step?: number; userId?: string }) => {
  React.useEffect(() => {
    AutoSaveManager.autoSave(key, data, options);
  }, [key, data, options?.step, options?.userId]);
};