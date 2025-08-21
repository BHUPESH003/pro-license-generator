import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { addNotification } from "../slices/uiSlice";
import { store } from "../index";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Type guard to check if error is a FetchBaseQueryError
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

/**
 * Type guard to check if error is a SerializedError
 */
export function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === "object" && error != null && "message" in error;
}

/**
 * Extract error message from RTK Query error
 */
export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined
): string {
  if (!error) return "An unknown error occurred";

  if (isFetchBaseQueryError(error)) {
    if (error.status === "FETCH_ERROR") {
      return "Network error - please check your connection";
    }

    if (error.status === "PARSING_ERROR") {
      return "Invalid response from server";
    }

    if (error.status === "TIMEOUT_ERROR") {
      return "Request timed out - please try again";
    }

    if (typeof error.status === "number") {
      const data = error.data as any;

      if (data?.message) {
        return data.message;
      }

      switch (error.status) {
        case 400:
          return "Invalid request - please check your input";
        case 401:
          return "Authentication required - please log in";
        case 403:
          return "Access denied - insufficient permissions";
        case 404:
          return "Resource not found";
        case 409:
          return "Conflict - resource already exists or is in use";
        case 422:
          return "Validation error - please check your input";
        case 429:
          return "Too many requests - please try again later";
        case 500:
          return "Server error - please try again later";
        case 502:
          return "Bad gateway - service temporarily unavailable";
        case 503:
          return "Service unavailable - please try again later";
        default:
          return `Request failed with status ${error.status}`;
      }
    }
  }

  if (isSerializedError(error)) {
    return error.message || "An error occurred";
  }

  return "An unknown error occurred";
}

/**
 * Get error details for debugging
 */
export function getErrorDetails(
  error: FetchBaseQueryError | SerializedError | undefined
): any {
  if (!error) return null;

  if (isFetchBaseQueryError(error)) {
    return {
      status: error.status,
      data: error.data,
    };
  }

  if (isSerializedError(error)) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

/**
 * Show error notification
 */
export function showErrorNotification(
  error: FetchBaseQueryError | SerializedError | undefined,
  title: string = "Error"
) {
  const message = getErrorMessage(error);

  store.dispatch(
    addNotification({
      type: "error",
      title,
      message,
      autoClose: true,
      duration: 5000,
    })
  );
}

/**
 * Show success notification
 */
export function showSuccessNotification(
  message: string,
  title: string = "Success"
) {
  store.dispatch(
    addNotification({
      type: "success",
      title,
      message,
      autoClose: true,
      duration: 3000,
    })
  );
}

/**
 * Show warning notification
 */
export function showWarningNotification(
  message: string,
  title: string = "Warning"
) {
  store.dispatch(
    addNotification({
      type: "warning",
      title,
      message,
      autoClose: true,
      duration: 4000,
    })
  );
}

/**
 * Show info notification
 */
export function showInfoNotification(message: string, title: string = "Info") {
  store.dispatch(
    addNotification({
      type: "info",
      title,
      message,
      autoClose: true,
      duration: 3000,
    })
  );
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  error: FetchBaseQueryError | SerializedError | undefined
) {
  if (isFetchBaseQueryError(error) && error.status === 401) {
    // Clear token and redirect to login
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    return true;
  }
  return false;
}

/**
 * Retry configuration for different error types
 */
export function shouldRetry(
  error: FetchBaseQueryError | SerializedError | undefined,
  attempt: number,
  maxAttempts: number = 3
): boolean {
  if (attempt >= maxAttempts) return false;

  if (isFetchBaseQueryError(error)) {
    // Don't retry client errors (4xx)
    if (
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return false;
    }

    // Retry network errors and server errors (5xx)
    if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
      return true;
    }

    if (typeof error.status === "number" && error.status >= 500) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(
  attempt: number,
  baseDelay: number = 1000
): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
}

/**
 * Generic error handler for mutations
 */
export function createMutationErrorHandler(operationName: string) {
  return (error: FetchBaseQueryError | SerializedError | undefined) => {
    if (!handleAuthError(error)) {
      showErrorNotification(error, `Failed to ${operationName}`);
    }
  };
}

/**
 * Generic error handler for queries
 */
export function createQueryErrorHandler(resourceName: string) {
  return (error: FetchBaseQueryError | SerializedError | undefined) => {
    if (!handleAuthError(error)) {
      showErrorNotification(error, `Failed to load ${resourceName}`);
    }
  };
}
