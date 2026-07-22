import { useState, useEffect, useCallback } from 'react';

export function useFormPersist<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved) as T;
    } catch { /* ignore */ }
    return initialValue;
  });

  const save = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToSave = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try { localStorage.setItem(key, JSON.stringify(valueToSave)); } catch { /* ignore */ }
      return valueToSave;
    });
  }, [key]);

  const clear = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    setValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value]);

  return [value, save, clear];
}
