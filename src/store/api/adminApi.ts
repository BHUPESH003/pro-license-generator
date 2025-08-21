import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/admin/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with error handling and token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }

  return result;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Dashboard",
    "License",
    "Device",
    "User",
    "TelemetryEvent",
    "AuditLog",
    "Settings",
    "SystemHealth",
    "Webhook",
  ],
  endpoints: (builder) => ({
    // Dashboard endpoints
    getDashboardMetrics: builder.query<any, void>({
      query: () => "dashboard/metrics",
      providesTags: ["Dashboard"],
    }),

    getDashboardCharts: builder.query<any, { timeRange: string }>({
      query: ({ timeRange }) => `dashboard/charts?timeRange=${timeRange}`,
      providesTags: ["Dashboard"],
    }),

    // License endpoints
    getLicenses: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: string;
        filters?: Record<string, string>;
      }
    >({
      query: ({
        page = 1,
        pageSize = 25,
        sortBy = "createdAt",
        sortDir = "desc",
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortDir,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `licenses?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "License" as const,
                id,
              })),
              { type: "License", id: "LIST" },
            ]
          : [{ type: "License", id: "LIST" }],
    }),

    getLicense: builder.query<any, string>({
      query: (id) => `licenses/${id}`,
      providesTags: (result, error, id) => [{ type: "License", id }],
    }),

    updateLicense: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `licenses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "License", id },
        { type: "License", id: "LIST" },
        "Dashboard",
      ],
    }),

    // Device endpoints
    getDevices: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: string;
        filters?: Record<string, string>;
      }
    >({
      query: ({
        page = 1,
        pageSize = 25,
        sortBy = "lastSeenAt",
        sortDir = "desc",
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortDir,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `devices?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "Device" as const,
                id,
              })),
              { type: "Device", id: "LIST" },
            ]
          : [{ type: "Device", id: "LIST" }],
    }),

    getDevice: builder.query<any, string>({
      query: (id) => `devices/${id}`,
      providesTags: (result, error, id) => [{ type: "Device", id }],
    }),

    updateDevice: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `devices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Device", id },
        { type: "Device", id: "LIST" },
        "Dashboard",
      ],
    }),

    // User endpoints
    getUsers: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: string;
        filters?: Record<string, string>;
      }
    >({
      query: ({
        page = 1,
        pageSize = 25,
        sortBy = "createdAt",
        sortDir = "desc",
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortDir,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `users?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUser: builder.query<any, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        "Dashboard",
      ],
    }),

    // Telemetry endpoints
    getTelemetryEvents: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: string;
        filters?: Record<string, string>;
      }
    >({
      query: ({
        page = 1,
        pageSize = 25,
        sortBy = "occurredAt",
        sortDir = "desc",
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortDir,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `telemetry?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "TelemetryEvent" as const,
                id,
              })),
              { type: "TelemetryEvent", id: "LIST" },
            ]
          : [{ type: "TelemetryEvent", id: "LIST" }],
    }),

    getTelemetryEvent: builder.query<any, string>({
      query: (id) => `telemetry/${id}`,
      providesTags: (result, error, id) => [{ type: "TelemetryEvent", id }],
    }),

    // Audit endpoints
    getAuditLogs: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: string;
        filters?: Record<string, string>;
      }
    >({
      query: ({
        page = 1,
        pageSize = 25,
        sortBy = "createdAt",
        sortDir = "desc",
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortDir,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `audit?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "AuditLog" as const,
                id,
              })),
              { type: "AuditLog", id: "LIST" },
            ]
          : [{ type: "AuditLog", id: "LIST" }],
    }),

    getAuditLog: builder.query<any, string>({
      query: (id) => `audit/${id}`,
      providesTags: (result, error, id) => [{ type: "AuditLog", id }],
    }),

    // Settings endpoints
    getSystemSettings: builder.query<any, void>({
      query: () => "settings",
      providesTags: ["Settings"],
    }),

    updateSystemSettings: builder.mutation<any, any>({
      query: (settings) => ({
        url: "settings",
        method: "PUT",
        body: { settings },
      }),
      invalidatesTags: ["Settings"],
    }),

    getRateLimits: builder.query<any, void>({
      query: () => "settings/rate-limits",
      providesTags: ["Settings"],
    }),

    updateRateLimits: builder.mutation<any, any>({
      query: (config) => ({
        url: "settings/rate-limits",
        method: "PUT",
        body: { config },
      }),
      invalidatesTags: ["Settings"],
    }),

    getSystemHealth: builder.query<any, void>({
      query: () => "settings/health",
      providesTags: ["SystemHealth"],
    }),

    getWebhookStatus: builder.query<any, void>({
      query: () => "settings/webhooks",
      providesTags: ["Webhook"],
    }),

    testWebhook: builder.mutation<any, { webhookId: string }>({
      query: ({ webhookId }) => ({
        url: "settings/webhooks",
        method: "POST",
        body: { webhookId },
      }),
      invalidatesTags: ["Webhook"],
    }),

    // Admin user management
    getAdminUsers: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        filters?: Record<string, string>;
      }
    >({
      query: ({ page = 1, pageSize = 10, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[`filter_${key}`] = value;
            return acc;
          }, {} as Record<string, string>),
        });
        return `settings/admins?${params}`;
      },
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }: any) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "ADMIN_LIST" },
            ]
          : [{ type: "User", id: "ADMIN_LIST" }],
    }),

    createAdminUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "settings/admins",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "ADMIN_LIST" }],
    }),

    updateAdminUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `settings/admins/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),

    deleteAdminUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `settings/admins/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Dashboard
  useGetDashboardMetricsQuery,
  useGetDashboardChartsQuery,

  // Licenses
  useGetLicensesQuery,
  useGetLicenseQuery,
  useUpdateLicenseMutation,

  // Devices
  useGetDevicesQuery,
  useGetDeviceQuery,
  useUpdateDeviceMutation,

  // Users
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,

  // Telemetry
  useGetTelemetryEventsQuery,
  useGetTelemetryEventQuery,

  // Audit
  useGetAuditLogsQuery,
  useGetAuditLogQuery,

  // Settings
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetRateLimitsQuery,
  useUpdateRateLimitsMutation,
  useGetSystemHealthQuery,
  useGetWebhookStatusQuery,
  useTestWebhookMutation,

  // Admin users
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminApi;
