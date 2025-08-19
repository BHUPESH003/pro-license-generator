import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DevicesState {
  selectedDeviceIds: string[];
  filters: {
    status: string[];
    platform: string[];
    userId: string | null;
    licenseId: string | null;
    lastSeenAfter: string | null;
    lastSeenBefore: string | null;
    deviceGuid: string | null;
  };
  sorting: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  bulkActions: {
    selectedAction: string | null;
    isProcessing: boolean;
  };
  viewMode: "table" | "grid";
}

const initialState: DevicesState = {
  selectedDeviceIds: [],
  filters: {
    status: [],
    platform: [],
    userId: null,
    licenseId: null,
    lastSeenAfter: null,
    lastSeenBefore: null,
    deviceGuid: null,
  },
  sorting: {
    field: "lastSeenAt",
    direction: "desc",
  },
  pagination: {
    page: 1,
    pageSize: 25,
  },
  bulkActions: {
    selectedAction: null,
    isProcessing: false,
  },
  viewMode: "table",
};

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    setSelectedDeviceIds: (state, action: PayloadAction<string[]>) => {
      state.selectedDeviceIds = action.payload;
    },
    toggleDeviceSelection: (state, action: PayloadAction<string>) => {
      const deviceId = action.payload;
      const index = state.selectedDeviceIds.indexOf(deviceId);
      if (index > -1) {
        state.selectedDeviceIds.splice(index, 1);
      } else {
        state.selectedDeviceIds.push(deviceId);
      }
    },
    clearDeviceSelection: (state) => {
      state.selectedDeviceIds = [];
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<DevicesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSorting: (
      state,
      action: PayloadAction<{ field: string; direction: "asc" | "desc" }>
    ) => {
      state.sorting = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number }>
    ) => {
      state.pagination = action.payload;
    },
    setBulkAction: (state, action: PayloadAction<string | null>) => {
      state.bulkActions.selectedAction = action.payload;
    },
    setBulkActionProcessing: (state, action: PayloadAction<boolean>) => {
      state.bulkActions.isProcessing = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"table" | "grid">) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
});

export const {
  setSelectedDeviceIds,
  toggleDeviceSelection,
  clearDeviceSelection,
  setFilters,
  setSorting,
  setPagination,
  setBulkAction,
  setBulkActionProcessing,
  setViewMode,
  resetFilters,
} = devicesSlice.actions;

export default devicesSlice.reducer;
