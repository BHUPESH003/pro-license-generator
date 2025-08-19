import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  // Drawer states
  drawers: {
    userDetail: {
      isOpen: boolean;
      userId: string | null;
    };
    licenseDetail: {
      isOpen: boolean;
      licenseId: string | null;
    };
    deviceDetail: {
      isOpen: boolean;
      deviceId: string | null;
    };
    telemetryDetail: {
      isOpen: boolean;
      eventId: string | null;
    };
    auditDetail: {
      isOpen: boolean;
      auditId: string | null;
    };
  };

  // Dialog states
  dialogs: {
    userAction: {
      isOpen: boolean;
      userId: string | null;
      action: string | null;
    };
    licenseAction: {
      isOpen: boolean;
      licenseId: string | null;
      action: string | null;
    };
    deviceAction: {
      isOpen: boolean;
      deviceId: string | null;
      action: string | null;
    };
    confirmDelete: {
      isOpen: boolean;
      entityType: string | null;
      entityId: string | null;
      entityName: string | null;
    };
    bulkAction: {
      isOpen: boolean;
      entityType: string | null;
      action: string | null;
      selectedIds: string[];
    };
  };

  // Navigation state
  navigation: {
    sidebarOpen: boolean;
    currentPage: string;
    breadcrumbs: Array<{ label: string; href?: string }>;
  };

  // Loading states
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };

  // Notification state
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
    autoClose?: boolean;
    duration?: number;
  }>;

  // Theme and preferences
  preferences: {
    theme: "light" | "dark" | "system";
    density: "comfortable" | "compact";
    animations: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

const initialState: UIState = {
  drawers: {
    userDetail: { isOpen: false, userId: null },
    licenseDetail: { isOpen: false, licenseId: null },
    deviceDetail: { isOpen: false, deviceId: null },
    telemetryDetail: { isOpen: false, eventId: null },
    auditDetail: { isOpen: false, auditId: null },
  },
  dialogs: {
    userAction: { isOpen: false, userId: null, action: null },
    licenseAction: { isOpen: false, licenseId: null, action: null },
    deviceAction: { isOpen: false, deviceId: null, action: null },
    confirmDelete: {
      isOpen: false,
      entityType: null,
      entityId: null,
      entityName: null,
    },
    bulkAction: {
      isOpen: false,
      entityType: null,
      action: null,
      selectedIds: [],
    },
  },
  navigation: {
    sidebarOpen: false,
    currentPage: "",
    breadcrumbs: [],
  },
  loading: {
    global: false,
    operations: {},
  },
  notifications: [],
  preferences: {
    theme: "system",
    density: "comfortable",
    animations: true,
    autoRefresh: true,
    refreshInterval: 30000,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Drawer actions
    openUserDetailDrawer: (state, action: PayloadAction<string>) => {
      state.drawers.userDetail = { isOpen: true, userId: action.payload };
    },
    closeUserDetailDrawer: (state) => {
      state.drawers.userDetail = { isOpen: false, userId: null };
    },
    openLicenseDetailDrawer: (state, action: PayloadAction<string>) => {
      state.drawers.licenseDetail = { isOpen: true, licenseId: action.payload };
    },
    closeLicenseDetailDrawer: (state) => {
      state.drawers.licenseDetail = { isOpen: false, licenseId: null };
    },
    openDeviceDetailDrawer: (state, action: PayloadAction<string>) => {
      state.drawers.deviceDetail = { isOpen: true, deviceId: action.payload };
    },
    closeDeviceDetailDrawer: (state) => {
      state.drawers.deviceDetail = { isOpen: false, deviceId: null };
    },
    openTelemetryDetailDrawer: (state, action: PayloadAction<string>) => {
      state.drawers.telemetryDetail = { isOpen: true, eventId: action.payload };
    },
    closeTelemetryDetailDrawer: (state) => {
      state.drawers.telemetryDetail = { isOpen: false, eventId: null };
    },
    openAuditDetailDrawer: (state, action: PayloadAction<string>) => {
      state.drawers.auditDetail = { isOpen: true, auditId: action.payload };
    },
    closeAuditDetailDrawer: (state) => {
      state.drawers.auditDetail = { isOpen: false, auditId: null };
    },

    // Dialog actions
    openUserActionDialog: (
      state,
      action: PayloadAction<{ userId: string; action: string }>
    ) => {
      state.dialogs.userAction = { isOpen: true, ...action.payload };
    },
    closeUserActionDialog: (state) => {
      state.dialogs.userAction = { isOpen: false, userId: null, action: null };
    },
    openLicenseActionDialog: (
      state,
      action: PayloadAction<{ licenseId: string; action: string }>
    ) => {
      state.dialogs.licenseAction = { isOpen: true, ...action.payload };
    },
    closeLicenseActionDialog: (state) => {
      state.dialogs.licenseAction = {
        isOpen: false,
        licenseId: null,
        action: null,
      };
    },
    openDeviceActionDialog: (
      state,
      action: PayloadAction<{ deviceId: string; action: string }>
    ) => {
      state.dialogs.deviceAction = { isOpen: true, ...action.payload };
    },
    closeDeviceActionDialog: (state) => {
      state.dialogs.deviceAction = {
        isOpen: false,
        deviceId: null,
        action: null,
      };
    },
    openConfirmDeleteDialog: (
      state,
      action: PayloadAction<{
        entityType: string;
        entityId: string;
        entityName: string;
      }>
    ) => {
      state.dialogs.confirmDelete = { isOpen: true, ...action.payload };
    },
    closeConfirmDeleteDialog: (state) => {
      state.dialogs.confirmDelete = {
        isOpen: false,
        entityType: null,
        entityId: null,
        entityName: null,
      };
    },
    openBulkActionDialog: (
      state,
      action: PayloadAction<{
        entityType: string;
        action: string;
        selectedIds: string[];
      }>
    ) => {
      state.dialogs.bulkAction = { isOpen: true, ...action.payload };
    },
    closeBulkActionDialog: (state) => {
      state.dialogs.bulkAction = {
        isOpen: false,
        entityType: null,
        action: null,
        selectedIds: [],
      };
    },

    // Navigation actions
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.navigation.sidebarOpen = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.navigation.currentPage = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<Array<{ label: string; href?: string }>>
    ) => {
      state.navigation.breadcrumbs = action.payload;
    },

    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setOperationLoading: (
      state,
      action: PayloadAction<{ operation: string; loading: boolean }>
    ) => {
      const { operation, loading } = action.payload;
      if (loading) {
        state.loading.operations[operation] = true;
      } else {
        delete state.loading.operations[operation];
      }
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UIState["notifications"][0], "id" | "timestamp">
      >
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Preference actions
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.preferences.theme = action.payload;
    },
    setDensity: (state, action: PayloadAction<"comfortable" | "compact">) => {
      state.preferences.density = action.payload;
    },
    setAnimations: (state, action: PayloadAction<boolean>) => {
      state.preferences.animations = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.preferences.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.preferences.refreshInterval = action.payload;
    },
  },
});

export const {
  // Drawer actions
  openUserDetailDrawer,
  closeUserDetailDrawer,
  openLicenseDetailDrawer,
  closeLicenseDetailDrawer,
  openDeviceDetailDrawer,
  closeDeviceDetailDrawer,
  openTelemetryDetailDrawer,
  closeTelemetryDetailDrawer,
  openAuditDetailDrawer,
  closeAuditDetailDrawer,

  // Dialog actions
  openUserActionDialog,
  closeUserActionDialog,
  openLicenseActionDialog,
  closeLicenseActionDialog,
  openDeviceActionDialog,
  closeDeviceActionDialog,
  openConfirmDeleteDialog,
  closeConfirmDeleteDialog,
  openBulkActionDialog,
  closeBulkActionDialog,

  // Navigation actions
  setSidebarOpen,
  setCurrentPage,
  setBreadcrumbs,

  // Loading actions
  setGlobalLoading,
  setOperationLoading,

  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,

  // Preference actions
  setTheme,
  setDensity,
  setAnimations,
  setAutoRefresh,
  setRefreshInterval,
} = uiSlice.actions;

export default uiSlice.reducer;
