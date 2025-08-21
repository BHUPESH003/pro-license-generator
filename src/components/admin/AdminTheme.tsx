"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(
  undefined
);

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
}

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    const savedSidebar = localStorage.getItem("admin-sidebar-collapsed");

    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      // Default to system preference
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    if (savedSidebar) {
      setSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(
      "admin-sidebar-collapsed",
      sidebarCollapsed.toString()
    );
  }, [sidebarCollapsed]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AdminThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        sidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

// Admin-specific CSS custom properties
export const adminThemeStyles = `
  :root {
    --admin-primary: #3b82f6;
    --admin-primary-hover: #2563eb;
    --admin-secondary: #f1f5f9;
    --admin-accent: #06b6d4;
    --admin-error: #ef4444;
    --admin-error-hover: #dc2626;
    --admin-success: #10b981;
    --admin-warning: #f59e0b;
    --admin-surface: #ffffff;
    --admin-background: #f8fafc;
    --admin-foreground: #0f172a;
    --admin-muted: #64748b;
    --admin-border: #e2e8f0;
    --admin-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --admin-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .dark {
    --admin-surface: #1e293b;
    --admin-background: #0f172a;
    --admin-foreground: #f8fafc;
    --admin-muted: #94a3b8;
    --admin-border: #334155;
    --admin-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
    --admin-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  }

  .admin-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--admin-muted) transparent;
  }

  .admin-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .admin-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .admin-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--admin-muted);
    border-radius: 3px;
  }

  .admin-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: var(--admin-foreground);
  }

  .admin-glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .admin-glass {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(51, 65, 85, 0.5);
  }

  .admin-gradient-primary {
    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-accent) 100%);
  }

  .admin-gradient-surface {
    background: linear-gradient(135deg, var(--admin-surface) 0%, rgba(248, 250, 252, 0.8) 100%);
  }

  .dark .admin-gradient-surface {
    background: linear-gradient(135deg, var(--admin-surface) 0%, rgba(15, 23, 42, 0.8) 100%);
  }
`;

export default AdminThemeProvider;
