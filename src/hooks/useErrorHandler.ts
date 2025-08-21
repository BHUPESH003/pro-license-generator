"use client";

import { useCallback } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import {
  getErrorMessage,
  handleAuthError,
  isFetchBaseQueryError,
} from "@/store/utils/errorHandling";

export interface UseErrorHandlerOptions {
  showNotification?: boolean;
  redirectOnAuth?: boolean;
  customMessage?: string;
  onError?: (error: FetchBaseQueryError | SerializedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showNotification = true,
    redirectOnAuth = true,
    customMessage,
    onError,
  } = options;

  const dispatch = useAppDispatch();

  const handleError = useCallback(
    (
      error: FetchBaseQueryError | SerializedError | undefined,
      context?: string
    ) => {
      if (!error) return;

      // Handle authentication errors
      if (redirectOnAuth && handleAuthError(error)) {
        return;
      }

      // Get error message
      const message = customMessage || getErrorMessage(error);
      const title = context ? `${context} Failed` : "Error";

      // Show notification if enabled
      if (showNotification) {
        dispatch(
          addNotification({
            type: "error",
            title,
            message,
            autoClose: true,
            duration: 5000,
          })
        );
      }

      // Call custom error handler if provided
      if (onError) {
        onError(error);
      }

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error handled:", { error, context, message });
      }
    },
    [dispatch, showNotification, redirectOnAuth, customMessage, onError]
  );

  const handleSuccess = useCallback(
    (message: string, context?: string) => {
      const title = context ? `${context} Successful` : "Success";

      dispatch(
        addNotification({
          type: "success",
          title,
          message,
          autoClose: true,
          duration: 3000,
        })
      );
    },
    [dispatch]
  );

  const handleWarning = useCallback(
    (message: string, context?: string) => {
      const title = context ? `${context} Warning` : "Warning";

      dispatch(
        addNotification({
          type: "warning",
          title,
          message,
          autoClose: true,
          duration: 4000,
        })
      );
    },
    [dispatch]
  );

  const handleInfo = useCallback(
    (message: string, context?: string) => {
      const title = context ? `${context} Info` : "Info";

      dispatch(
        addNotification({
          type: "info",
          title,
          message,
          autoClose: true,
          duration: 3000,
        })
      );
    },
    [dispatch]
  );

  const isNetworkError = useCallback(
    (error: FetchBaseQueryError | SerializedError | undefined) => {
      return isFetchBaseQueryError(error) && error.status === "FETCH_ERROR";
    },
    []
  );

  const isServerError = useCallback(
    (error: FetchBaseQueryError | SerializedError | undefined) => {
      return (
        isFetchBaseQueryError(error) &&
        typeof error.status === "number" &&
        error.status >= 500
      );
    },
    []
  );

  const isClientError = useCallback(
    (error: FetchBaseQueryError | SerializedError | undefined) => {
      return (
        isFetchBaseQueryError(error) &&
        typeof error.status === "number" &&
        error.status >= 400 &&
        error.status < 500
      );
    },
    []
  );

  const isAuthError = useCallback(
    (error: FetchBaseQueryError | SerializedError | undefined) => {
      return (
        isFetchBaseQueryError(error) &&
        (error.status === 401 || error.status === 403)
      );
    },
    []
  );

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    isNetworkError,
    isServerError,
    isClientError,
    isAuthError,
  };
}
