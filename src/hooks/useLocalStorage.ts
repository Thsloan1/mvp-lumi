import { useState, useEffect } from 'react';
import { safeJsonParse, safeJsonStringify } from '../utils/jsonUtils';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return safeJsonParse(item, initialValue);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      const jsonString = safeJsonStringify(value);
      window.localStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}