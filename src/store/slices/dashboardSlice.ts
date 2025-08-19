import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  timeRange: string;
  selectedMetrics: string[];
  refreshInterval: number | null;
  lastRefresh: number | null;
  filters: {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    entityTypes: string[];
  };
}

const initialState: DashboardState = {
  timeRange: "7d",
  selectedMetrics: ["users", "licenses", "devices", "revenue"],
  refreshInterval: 30000, // 30 seconds
  lastRefresh: null,
  filters: {
    dateRange: {
      start: null,
      end: null,
    },
    entityTypes: [],
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<string>) => {
      state.timeRange = action.payload;
    },
    setSelectedMetrics: (state, action: PayloadAction<string[]>) => {
      state.selectedMetrics = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number | null>) => {
      state.refreshInterval = action.payload;
    },
    setLastRefresh: (state, action: PayloadAction<number>) => {
      state.lastRefresh = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) => {
      state.filters.dateRange = action.payload;
    },
    setEntityTypeFilters: (state, action: PayloadAction<string[]>) => {
      state.filters.entityTypes = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.timeRange = initialState.timeRange;
    },
  },
});

export const {
  setTimeRange,
  setSelectedMetrics,
  setRefreshInterval,
  setLastRefresh,
  setDateRange,
  setEntityTypeFilters,
  resetFilters,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
