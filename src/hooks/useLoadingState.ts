"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOperationLoading, setGlobalLoading } from "@/store/slices/uiSlice";

export interface UseLoadingStateOptions {
  global?: boolean;
  operationKey?: string;
  minDuration?: number; // Minimum loading duration in ms
  debounce?: number; // Debounce delay in ms
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    global = false,
    operationKey,
    minDuration = 0,
    debounce = 0,
  } = options;

  const dispatch = useAppDispatch();
  const [localLoading, setLocalLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  // Get global loading state from Redux
  const globalLoading = useAppSelector((state) => state.ui.loading.global);
  const operationLoading = useAppSelector((state) =>
    operationKey ? state.ui.loading.operations[operationKey] || false : false
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      if (debounce > 0 && loading) {
        // Debounce loading start
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          startTimeRef.current = Date.now();

          if (global) {
            dispatch(setGlobalLoading(true));
          } else if (operationKey) {
            dispatch(
              setOperationLoading({ operation: operationKey, loading: true })
            );
          } else {
            setLocalLoading(true);
          }
        }, debounce);
      } else if (loading) {
        // Start loading immediately
        startTimeRef.current = Date.now();

        if (global) {
          dispatch(setGlobalLoading(true));
        } else if (operationKey) {
          dispatch(
            setOperationLoading({ operation: operationKey, loading: true })
          );
        } else {
          setLocalLoading(true);
        }
      } else {
        // Stop loading with minimum duration
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
          debounceTimeoutRef.current = undefined;
        }

        const stopLoading = () => {
          if (global) {
            dispatch(setGlobalLoading(false));
          } else if (operationKey) {
            dispatch(
              setOperationLoading({ operation: operationKey, loading: false })
            );
          } else {
            setLocalLoading(false);
          }
        };

        if (minDuration > 0 && startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = minDuration - elapsed;

          if (remaining > 0) {
            loadingTimeoutRef.current = setTimeout(stopLoading, remaining);
          } else {
            stopLoading();
          }
        } else {
          stopLoading();
        }
      }
    },
    [dispatch, global, operationKey, minDuration, debounce]
  );

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Determine current loading state
  const isLoading = global
    ? globalLoading
    : operationKey
    ? operationLoading
    : localLoading;

  return {
    isLoading,
    setLoading,
    withLoading,
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const withLoading = useCallback(
    async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading]
  );

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    clearAll,
    loadingStates,
  };
}
