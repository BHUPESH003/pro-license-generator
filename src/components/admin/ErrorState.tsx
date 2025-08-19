"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  Server,
  Shield,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  error?: {
    status?: number | string;
    message?: string;
    code?: string;
  };
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  className?: string;
}

export default function ErrorState({
  error,
  title,
  description,
  onRetry,
  retryLabel = "Try Again",
  showRetry = true,
  className = "",
}: ErrorStateProps) {
  const getErrorIcon = () => {
    if (!error?.status) return AlertTriangle;

    if (typeof error.status === "string") {
      switch (error.status) {
        case "FETCH_ERROR":
          return Wifi;
        case "TIMEOUT_ERROR":
          return Server;
        default:
          return AlertTriangle;
      }
    }

    if (typeof error.status === "number") {
      if (error.status >= 500) return Server;
      if (error.status === 401 || error.status === 403) return Shield;
      if (error.status === 404) return Database;
    }

    return AlertTriangle;
  };

  const getErrorTitle = () => {
    if (title) return title;

    if (!error?.status) return "Something went wrong";

    if (typeof error.status === "string") {
      switch (error.status) {
        case "FETCH_ERROR":
          return "Connection Error";
        case "TIMEOUT_ERROR":
          return "Request Timeout";
        case "PARSING_ERROR":
          return "Invalid Response";
        default:
          return "Error";
      }
    }

    if (typeof error.status === "number") {
      switch (error.status) {
        case 400:
          return "Bad Request";
        case 401:
          return "Authentication Required";
        case 403:
          return "Access Denied";
        case 404:
          return "Not Found";
        case 409:
          return "Conflict";
        case 422:
          return "Validation Error";
        case 429:
          return "Too Many Requests";
        case 500:
          return "Server Error";
        case 502:
          return "Bad Gateway";
        case 503:
          return "Service Unavailable";
        default:
          return `Error ${error.status}`;
      }
    }

    return "Error";
  };

  const getErrorDescription = () => {
    if (description) return description;
    if (error?.message) return error.message;

    if (!error?.status)
      return "An unexpected error occurred. Please try again.";

    if (typeof error.status === "string") {
      switch (error.status) {
        case "FETCH_ERROR":
          return "Unable to connect to the server. Please check your internet connection.";
        case "TIMEOUT_ERROR":
          return "The request took too long to complete. Please try again.";
        case "PARSING_ERROR":
          return "Received an invalid response from the server.";
        default:
          return "An error occurred while processing your request.";
      }
    }

    if (typeof error.status === "number") {
      switch (error.status) {
        case 400:
          return "The request was invalid. Please check your input and try again.";
        case 401:
          return "You need to log in to access this resource.";
        case 403:
          return "You don't have permission to access this resource.";
        case 404:
          return "The requested resource could not be found.";
        case 409:
          return "There was a conflict with the current state of the resource.";
        case 422:
          return "The request data failed validation. Please check your input.";
        case 429:
          return "Too many requests. Please wait a moment before trying again.";
        case 500:
          return "An internal server error occurred. Please try again later.";
        case 502:
          return "The server is temporarily unavailable. Please try again later.";
        case 503:
          return "The service is temporarily unavailable. Please try again later.";
        default:
          return "An error occurred while processing your request.";
      }
    }

    return "An unexpected error occurred. Please try again.";
  };

  const getErrorColor = () => {
    if (!error?.status) return "text-red-600 dark:text-red-400";

    if (typeof error.status === "number") {
      if (error.status >= 500) return "text-orange-600 dark:text-orange-400";
      if (error.status === 401 || error.status === 403)
        return "text-yellow-600 dark:text-yellow-400";
      if (error.status === 404) return "text-blue-600 dark:text-blue-400";
    }

    return "text-red-600 dark:text-red-400";
  };

  const ErrorIcon = getErrorIcon();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
        <ErrorIcon className={`h-8 w-8 ${getErrorColor()}`} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {getErrorTitle()}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        {getErrorDescription()}
      </p>

      {error?.code && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
          Error Code: {error.code}
        </p>
      )}

      {showRetry && onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
