// Safe JSON parsing utilities
export const safeJsonParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString || jsonString.trim() === '') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
};

export const safeJsonStringify = (data: any, defaultValue: string = '{}'): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
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