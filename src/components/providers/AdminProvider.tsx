"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentPage, setBreadcrumbs } from "@/store/slices/uiSlice";
import ErrorBoundary from "@/components/admin/ErrorBoundary";
import NotificationSystem from "@/components/admin/NotificationSystem";
import ReduxProvider from "./ReduxProvider";

interface AdminProviderProps {
  children: React.ReactNode;
}

function AdminProviderInner({ children }: AdminProviderProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Update current page and breadcrumbs based on pathname
  useEffect(() => {
    dispatch(setCurrentPage(pathname));

    // Generate breadcrumbs based on pathname
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      return {
        label,
        href: index === pathSegments.length - 1 ? undefined : href, // Last item has no href
      };
    });

    dispatch(setBreadcrumbs(breadcrumbs));
  }, [pathname, dispatch]);

  // Handle global error logging
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error caught:", error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      {children}
      <NotificationSystem />
    </ErrorBoundary>
  );
}

export default function AdminProvider({ children }: AdminProviderProps) {
  return (
    <ReduxProvider>
      <AdminProviderInner>{children}</AdminProviderInner>
    </ReduxProvider>
  );
}
