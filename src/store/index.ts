import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { adminApi } from "./api/adminApi";
import dashboardReducer from "./slices/dashboardSlice";
import licensesReducer from "./slices/licensesSlice";
import devicesReducer from "./slices/devicesSlice";
import usersReducer from "./slices/usersSlice";
import telemetryReducer from "./slices/telemetrySlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    // API slice
    [adminApi.reducerPath]: adminApi.reducer,

    // Feature slices
    dashboard: dashboardReducer,
    licenses: licensesReducer,
    devices: devicesReducer,
    users: usersReducer,
    telemetry: telemetryReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const md = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(adminApi.middleware);

    // Guard against undefined util in certain test environments
    try {
      const ignored = (adminApi as any)?.util?.getRunningQueriesThunk?.fulfilled
        ?.type;
      if (ignored) {
        // @ts-ignore adjust serializableCheck ignoredActions dynamically if available
        (md as any).options = {
          ...(md as any).options,
          serializableCheck: {
            ignoredActions: [ignored],
          },
        };
      }
    } catch {}

    return md;
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
