import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TelemetryState {
  selectedEventIds: string[];
  filters: {
    eventType: string[];
    userId: string | null;
    licenseId: string | null;
    deviceGuid: string | null;
    sessionId: string | null;
    occurredAfter: string | null;
    occurredBefore: string | null;
    appVersion: string | null;
    os: string | null;
  };
  sorting: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  analytics: {
    timeRange: string;
    groupBy: string;
    selectedMetrics: string[];
  };
  realTime: {
    enabled: boolean;
    interval: number;
    maxEvents: number;
  };
}

const initialState: TelemetryState = {
  selectedEventIds: [],
  filters: {
    eventType: [],
    userId: null,
    licenseId: null,
    deviceGuid: null,
    sessionId: null,
    occurredAfter: null,
    occurredBefore: null,
    appVersion: null,
    os: null,
  },
  sorting: {
    field: "occurredAt",
    direction: "desc",
  },
  pagination: {
    page: 1,
    pageSize: 25,
  },
  analytics: {
    timeRange: "24h",
    groupBy: "hour",
    selectedMetrics: ["events", "users", "sessions"],
  },
  realTime: {
    enabled: false,
    interval: 5000, // 5 seconds
    maxEvents: 100,
  },
};

const telemetrySlice = createSlice({
  name: "telemetry",
  initialState,
  reducers: {
    setSelectedEventIds: (state, action: PayloadAction<string[]>) => {
      state.selectedEventIds = action.payload;
    },
    toggleEventSelection: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const index = state.selectedEventIds.indexOf(eventId);
      if (index > -1) {
        state.selectedEventIds.splice(index, 1);
      } else {
        state.selectedEventIds.push(eventId);
      }
    },
    clearEventSelection: (state) => {
      state.selectedEventIds = [];
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<TelemetryState["filters"]>>
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
    setAnalyticsTimeRange: (state, action: PayloadAction<string>) => {
      state.analytics.timeRange = action.payload;
    },
    setAnalyticsGroupBy: (state, action: PayloadAction<string>) => {
      state.analytics.groupBy = action.payload;
    },
    setAnalyticsMetrics: (state, action: PayloadAction<string[]>) => {
      state.analytics.selectedMetrics = action.payload;
    },
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTime.enabled = action.payload;
    },
    setRealTimeInterval: (state, action: PayloadAction<number>) => {
      state.realTime.interval = action.payload;
    },
    setRealTimeMaxEvents: (state, action: PayloadAction<number>) => {
      state.realTime.maxEvents = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
});

export const {
  setSelectedEventIds,
  toggleEventSelection,
  clearEventSelection,
  setFilters,
  setSorting,
  setPagination,
  setAnalyticsTimeRange,
  setAnalyticsGroupBy,
  setAnalyticsMetrics,
  setRealTimeEnabled,
  setRealTimeInterval,
  setRealTimeMaxEvents,
  resetFilters,
} = telemetrySlice.actions;

export default telemetrySlice.reducer;
