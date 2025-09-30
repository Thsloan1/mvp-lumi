// Safe JSON parsing utilities
export const safeJsonParse = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (error) {
    console.warn('Failed to parse JSON:', error, 'Input:', jsonString);
    return defaultValue;
  }
};

export const safeJsonStringify = (data: any, defaultValue: string = '{}'): string => {
  try {
    if (data === null || data === undefined) {
      return defaultValue;
    }
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error, 'Data:', data);
    return defaultValue;
  }
};

// Safe localStorage operations
export const safeLocalStorageGet = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, defaultValue);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

export const safeLocalStorageSet = (key: string, value: any): boolean => {
  try {
    const jsonString = safeJsonStringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
    return false;
  }
};