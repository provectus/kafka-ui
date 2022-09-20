import { LOCAL_STORAGE_KEY_PREFIX } from 'lib/constants';
import { useState, useEffect } from 'react';

export const useLocalStorage = (featureKey: string, defaultValue: string) => {
  const key = `${LOCAL_STORAGE_KEY_PREFIX}-${featureKey}`;
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);

    if (saved !== null) {
      return JSON.parse(saved);
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
