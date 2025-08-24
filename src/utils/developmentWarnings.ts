// Development warnings for common configuration mistakes

interface WarningConfig {
  enabled: boolean;
  logLevel: "warn" | "error" | "info";
}

const defaultConfig: WarningConfig = {
  enabled: process.env.NODE_ENV === "development",
  logLevel: "warn",
};

class DevelopmentWarnings {
  private config: WarningConfig;
  private warnings: Set<string> = new Set();

  constructor(config: Partial<WarningConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private log(
    level: "warn" | "error" | "info",
    message: string,
    details?: any
  ) {
    if (!this.config.enabled) return;

    const warningKey = `${level}:${message}`;
    if (this.warnings.has(warningKey)) return; // Avoid duplicate warnings

    this.warnings.add(warningKey);

    const prefix = "🚨 CustomDataTable Warning:";
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case "error":
        console.error(fullMessage, details);
        break;
      case "warn":
        console.warn(fullMessage, details);
        break;
      case "info":
        console.info(fullMessage, details);
        break;
    }
  }

  // Column configuration warnings
  checkColumnConfiguration(columns: any[]) {
    if (!columns || columns.length === 0) {
      this.log("error", "No columns provided. Table will not render properly.");
      return;
    }

    columns.forEach((column, index) => {
      if (!column.field) {
        this.log(
          "error",
          `Column at index ${index} is missing required 'field' property.`
        );
      }

      if (!column.headerName) {
        this.log(
          "warn",
          `Column '${column.field}' is missing 'headerName'. Field name will be used as header.`
        );
      }

      if (column.width && column.width < 50) {
        this.log(
          "warn",
          `Column '${column.field}' has very small width (${column.width}px). Consider increasing for better usability.`
        );
      }

      if (column.cellRenderer && typeof column.cellRenderer !== "function") {
        this.log(
          "error",
          `Column '${column.field}' cellRenderer must be a function.`
        );
      }

      if (
        column.valueFormatter &&
        typeof column.valueFormatter !== "function"
      ) {
        this.log(
          "error",
          `Column '${column.field}' valueFormatter must be a function.`
        );
      }

      if (column.valueGetter && typeof column.valueGetter !== "function") {
        this.log(
          "error",
          `Column '${column.field}' valueGetter must be a function.`
        );
      }
    });

    // Check for duplicate field names
    const fieldNames = columns.map((col) => col.field).filter(Boolean);
    const duplicates = fieldNames.filter(
      (field, index) => fieldNames.indexOf(field) !== index
    );
    if (duplicates.length > 0) {
      this.log(
        "error",
        `Duplicate column fields detected: ${duplicates.join(
          ", "
        )}. This will cause rendering issues.`
      );
    }
  }

  // Filter configuration warnings
  checkFilterConfiguration(filters: any[]) {
    if (!filters) return;

    filters.forEach((filter, index) => {
      if (!filter.field) {
        this.log(
          "error",
          `Filter at index ${index} is missing required 'field' property.`
        );
      }

      if (!filter.type) {
        this.log(
          "error",
          `Filter '${filter.field}' is missing required 'type' property.`
        );
      }

      if (!filter.label) {
        this.log(
          "warn",
          `Filter '${filter.field}' is missing 'label'. Field name will be used as label.`
        );
      }

      if (
        filter.type === "select" &&
        (!filter.options || !Array.isArray(filter.options))
      ) {
        this.log(
          "error",
          `Select filter '${filter.field}' must have 'options' array.`
        );
      }

      if (filter.type === "select" && filter.options) {
        filter.options.forEach((option: any, optIndex: number) => {
          if (
            !option.hasOwnProperty("value") ||
            !option.hasOwnProperty("label")
          ) {
            this.log(
              "error",
              `Option at index ${optIndex} in filter '${filter.field}' must have 'value' and 'label' properties.`
            );
          }
        });
      }

      if (
        filter.debounceMs &&
        (filter.debounceMs < 0 || filter.debounceMs > 5000)
      ) {
        this.log(
          "warn",
          `Filter '${filter.field}' has unusual debounceMs value (${filter.debounceMs}). Consider using 100-1000ms range.`
        );
      }
    });
  }

  // Action configuration warnings
  checkActionConfiguration(actions: any[]) {
    if (!actions) return;

    actions.forEach((action, index) => {
      if (!action.label) {
        this.log(
          "error",
          `Action at index ${index} is missing required 'label' property.`
        );
      }

      if (!action.onClick || typeof action.onClick !== "function") {
        this.log(
          "error",
          `Action '${action.label}' must have 'onClick' function.`
        );
      }

      if (action.disabled && typeof action.disabled !== "function") {
        this.log(
          "error",
          `Action '${action.label}' disabled property must be a function.`
        );
      }

      if (action.hidden && typeof action.hidden !== "function") {
        this.log(
          "error",
          `Action '${action.label}' hidden property must be a function.`
        );
      }

      if (action.condition && typeof action.condition !== "function") {
        this.log(
          "warn",
          `Action '${action.label}' condition property is deprecated. Use 'hidden' instead.`
        );
      }

      const validVariants = [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ];
      if (action.variant && !validVariants.includes(action.variant)) {
        this.log(
          "warn",
          `Action '${action.label}' has invalid variant '${
            action.variant
          }'. Valid variants: ${validVariants.join(", ")}`
        );
      }
    });
  }

  // Performance warnings
  checkPerformanceConfiguration(props: any) {
    if (props.pageSize && props.pageSize > 100) {
      this.log(
        "warn",
        `Large pageSize (${props.pageSize}) may impact performance. Consider using smaller page sizes with pagination.`
      );
    }

    if (props.virtualScrolling === false && props.pageSize > 50) {
      this.log(
        "warn",
        "Virtual scrolling is disabled with large page size. This may cause performance issues."
      );
    }

    if (props.debugMode && process.env.NODE_ENV === "production") {
      this.log(
        "warn",
        "Debug mode is enabled in production. This may impact performance and expose sensitive information."
      );
    }

    if (!props.endpoint) {
      this.log(
        "error",
        "No endpoint provided. Table will not be able to fetch data."
      );
    }

    if (
      props.endpoint &&
      !props.endpoint.startsWith("/") &&
      !props.endpoint.startsWith("http")
    ) {
      this.log(
        "warn",
        `Endpoint '${props.endpoint}' should start with '/' for relative URLs or 'http' for absolute URLs.`
      );
    }
  }

  // Data warnings
  checkDataIntegrity(data: any[], columns: any[]) {
    if (!data || data.length === 0) return;

    const sampleSize = Math.min(5, data.length);
    const sampleData = data.slice(0, sampleSize);

    // Check for missing IDs
    const missingIds = sampleData.filter((row) => !row.id && !row._id);
    if (missingIds.length > 0) {
      this.log(
        "warn",
        `${missingIds.length} rows are missing 'id' or '_id' field. This may cause issues with row selection and updates.`
      );
    }

    // Check for missing column data
    const columnFields = columns.map((col) => col.field);
    sampleData.forEach((row, index) => {
      columnFields.forEach((field) => {
        if (
          row[field] === undefined &&
          !columns.find((col) => col.field === field)?.valueGetter
        ) {
          this.log(
            "info",
            `Row ${index} is missing data for column '${field}'. Consider using valueGetter or providing default values.`
          );
        }
      });
    });

    // Check for inconsistent data types
    columnFields.forEach((field) => {
      const values = sampleData
        .map((row) => row[field])
        .filter((val) => val !== null && val !== undefined);
      if (values.length > 1) {
        const types = [...new Set(values.map((val) => typeof val))];
        if (types.length > 1) {
          this.log(
            "warn",
            `Column '${field}' has inconsistent data types: ${types.join(
              ", "
            )}. This may cause rendering issues.`
          );
        }
      }
    });
  }

  // API response warnings
  checkApiResponse(response: any, endpoint: string) {
    if (!response) {
      this.log("error", `No response received from endpoint '${endpoint}'.`);
      return;
    }

    if (!response.success) {
      this.log(
        "error",
        `API response indicates failure for endpoint '${endpoint}': ${
          response.message || "Unknown error"
        }`
      );
    }

    if (!response.data) {
      this.log(
        "error",
        `API response missing 'data' property for endpoint '${endpoint}'.`
      );
      return;
    }

    const { data } = response;

    if (!Array.isArray(data.rows)) {
      this.log(
        "error",
        `API response 'data.rows' must be an array for endpoint '${endpoint}'.`
      );
    }

    if (typeof data.total !== "number") {
      this.log(
        "warn",
        `API response 'data.total' should be a number for endpoint '${endpoint}'.`
      );
    }

    if (typeof data.page !== "number") {
      this.log(
        "warn",
        `API response 'data.page' should be a number for endpoint '${endpoint}'.`
      );
    }

    if (typeof data.pageSize !== "number") {
      this.log(
        "warn",
        `API response 'data.pageSize' should be a number for endpoint '${endpoint}'.`
      );
    }

    if (data.rows && data.total && data.rows.length > data.total) {
      this.log(
        "warn",
        `API response has more rows (${data.rows.length}) than total (${data.total}) for endpoint '${endpoint}'.`
      );
    }
  }

  // State warnings
  checkStateConsistency(state: any) {
    if (state.page < 1) {
      this.log(
        "warn",
        `Invalid page number: ${state.page}. Page should be >= 1.`
      );
    }

    if (state.pageSize < 1) {
      this.log(
        "warn",
        `Invalid page size: ${state.pageSize}. Page size should be >= 1.`
      );
    }

    if (state.total < 0) {
      this.log("warn", `Invalid total: ${state.total}. Total should be >= 0.`);
    }

    if (state.totalPages && state.page > state.totalPages) {
      this.log(
        "warn",
        `Current page (${state.page}) exceeds total pages (${state.totalPages}).`
      );
    }

    if (state.selectedRows && state.selectedRows.size > state.data.length) {
      this.log(
        "warn",
        `Selected rows count (${state.selectedRows.size}) exceeds data length (${state.data.length}).`
      );
    }
  }

  // Clear all warnings (useful for testing)
  clearWarnings() {
    this.warnings.clear();
  }

  // Get warning count
  getWarningCount() {
    return this.warnings.size;
  }

  // Check if specific warning was issued
  hasWarning(message: string) {
    return Array.from(this.warnings).some((warning) =>
      warning.includes(message)
    );
  }
}

// Export singleton instance
export const developmentWarnings = new DevelopmentWarnings();

// Export class for custom instances
export { DevelopmentWarnings };

// Convenience function for quick checks
export function validateTableConfiguration(props: any) {
  developmentWarnings.checkColumnConfiguration(props.columns);
  developmentWarnings.checkFilterConfiguration(props.filters);
  developmentWarnings.checkActionConfiguration(props.actions);
  developmentWarnings.checkPerformanceConfiguration(props);
}
