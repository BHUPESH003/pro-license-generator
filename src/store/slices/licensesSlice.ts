import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LicensesState {
  selectedLicenseIds: string[];
  filters: {
    status: string[];
    plan: string[];
    userId: string | null;
    createdAfter: string | null;
    createdBefore: string | null;
    expiryAfter: string | null;
    expiryBefore: string | null;
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
}

const initialState: LicensesState = {
  selectedLicenseIds: [],
  filters: {
    status: [],
    plan: [],
    userId: null,
    createdAfter: null,
    createdBefore: null,
    expiryAfter: null,
    expiryBefore: null,
  },
  sorting: {
    field: "createdAt",
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
};

const licensesSlice = createSlice({
  name: "licenses",
  initialState,
  reducers: {
    setSelectedLicenseIds: (state, action: PayloadAction<string[]>) => {
      state.selectedLicenseIds = action.payload;
    },
    toggleLicenseSelection: (state, action: PayloadAction<string>) => {
      const licenseId = action.payload;
      const index = state.selectedLicenseIds.indexOf(licenseId);
      if (index > -1) {
        state.selectedLicenseIds.splice(index, 1);
      } else {
        state.selectedLicenseIds.push(licenseId);
      }
    },
    clearLicenseSelection: (state) => {
      state.selectedLicenseIds = [];
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<LicensesState["filters"]>>
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
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
});

export const {
  setSelectedLicenseIds,
  toggleLicenseSelection,
  clearLicenseSelection,
  setFilters,
  setSorting,
  setPagination,
  setBulkAction,
  setBulkActionProcessing,
  resetFilters,
} = licensesSlice.actions;

export default licensesSlice.reducer;
