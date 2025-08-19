"use client";

import React, { ReactNode } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import { TableSkeleton, CardSkeleton, ListSkeleton } from "./SkeletonLoader";

interface WithErrorHandlingProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  skeletonType?: "table" | "card" | "list" | "custom";
  skeletonProps?: any;
  className?: string;
}

export default function WithErrorHandling({
  children,
  isLoading = false,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  skeletonType = "table",
  skeletonProps = {},
  className = "",
}: WithErrorHandlingProps) {
  // Show error state
  if (error && !isLoading) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className={className}>
        <ErrorState
          error={error as any}
          onRetry={onRetry}
          showRetry={!!onRetry}
        />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    // Show skeleton based on type
    switch (skeletonType) {
      case "table":
        return (
          <div className={className}>
            <TableSkeleton {...skeletonProps} />
          </div>
        );
      case "card":
        return (
          <div className={className}>
            <CardSkeleton {...skeletonProps} />
          </div>
        );
      case "list":
        return (
          <div className={className}>
            <ListSkeleton {...skeletonProps} />
          </div>
        );
      case "custom":
        return (
          <div className={className}>
            <LoadingState />
          </div>
        );
      default:
        return (
          <div className={className}>
            <TableSkeleton {...skeletonProps} />
          </div>
        );
    }
  }

  // Show content
  return <div className={className}>{children}</div>;
}

// Higher-order component version
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorHandlingProps, "children"> = {}
) {
  return function WrappedComponent(props: P & WithErrorHandlingProps) {
    const {
      isLoading,
      error,
      onRetry,
      loadingComponent,
      errorComponent,
      skeletonType,
      skeletonProps,
      className,
      ...componentProps
    } = props;

    return (
      <WithErrorHandling
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        loadingComponent={loadingComponent}
        errorComponent={errorComponent}
        skeletonType={skeletonType}
        skeletonProps={skeletonProps}
        className={className}
        {...options}
      >
        <Component {...(componentProps as P)} />
      </WithErrorHandling>
    );
  };
}
