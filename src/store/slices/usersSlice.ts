import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  selectedUserIds: string[];
  filters: {
    role: string[];
    email: string | null;
    name: string | null;
    createdAfter: string | null;
    createdBefore: string | null;
    hasLicense: boolean | null;
    hasStripeCustomer: boolean | null;
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

const initialState: UsersState = {
  selectedUserIds: [],
  filters: {
    role: [],
    email: null,
    name: null,
    createdAfter: null,
    createdBefore: null,
    hasLicense: null,
    hasStripeCustomer: null,
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

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelectedUserIds: (state, action: PayloadAction<string[]>) => {
      state.selectedUserIds = action.payload;
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const index = state.selectedUserIds.indexOf(userId);
      if (index > -1) {
        state.selectedUserIds.splice(index, 1);
      } else {
        state.selectedUserIds.push(userId);
      }
    },
    clearUserSelection: (state) => {
      state.selectedUserIds = [];
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<UsersState["filters"]>>
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
  setSelectedUserIds,
  toggleUserSelection,
  clearUserSelection,
  setFilters,
  setSorting,
  setPagination,
  setBulkAction,
  setBulkActionProcessing,
  resetFilters,
} = usersSlice.actions;

export default usersSlice.reducer;
