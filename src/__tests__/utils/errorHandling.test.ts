import {
  getErrorMessage,
  getErrorDetails,
  isFetchBaseQueryError,
  isSerializedError,
  shouldRetry,
  getRetryDelay,
} from "@/store/utils/errorHandling";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

describe("Error Handling Utils", () => {
  describe("isFetchBaseQueryError", () => {
    it("should identify FetchBaseQueryError correctly", () => {
      const fetchError: FetchBaseQueryError = {
        status: 404,
        data: { message: "Not found" },
      };

      expect(isFetchBaseQueryError(fetchError)).toBe(true);
      expect(isFetchBaseQueryError({ message: "error" })).toBe(false);
      expect(isFetchBaseQueryError(null)).toBe(false);
    });
  });

  describe("isSerializedError", () => {
    it("should identify SerializedError correctly", () => {
      const serializedError: SerializedError = {
        message: "Something went wrong",
        name: "Error",
      };

      expect(isSerializedError(serializedError)).toBe(true);
      expect(isSerializedError({ status: 404 })).toBe(false);
      expect(isSerializedError(null)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should return default message for undefined error", () => {
      expect(getErrorMessage(undefined)).toBe("An unknown error occurred");
    });

    it("should handle FetchBaseQueryError with status codes", () => {
      const error404: FetchBaseQueryError = {
        status: 404,
        data: undefined,
      };
      expect(getErrorMessage(error404)).toBe("Resource not found");

      const error500: FetchBaseQueryError = {
        status: 500,
        data: undefined,
      };
      expect(getErrorMessage(error500)).toBe(
        "Server error - please try again later"
      );
    });

    it("should handle FetchBaseQueryError with custom message", () => {
      const errorWithMessage: FetchBaseQueryError = {
        status: 400,
        data: { message: "Custom error message" },
      };
      expect(getErrorMessage(errorWithMessage)).toBe("Custom error message");
    });

    it("should handle network errors", () => {
      const networkError: FetchBaseQueryError = {
        status: "FETCH_ERROR",
        error: "Network error",
      };
      expect(getErrorMessage(networkError)).toBe(
        "Network error - please check your connection"
      );
    });

    it("should handle SerializedError", () => {
      const serializedError: SerializedError = {
        message: "Serialized error message",
      };
      expect(getErrorMessage(serializedError)).toBe("Serialized error message");
    });
  });

  describe("getErrorDetails", () => {
    it("should return null for undefined error", () => {
      expect(getErrorDetails(undefined)).toBeNull();
    });

    it("should return details for FetchBaseQueryError", () => {
      const error: FetchBaseQueryError = {
        status: 404,
        data: { message: "Not found" },
      };

      const details = getErrorDetails(error);
      expect(details).toEqual({
        status: 404,
        data: { message: "Not found" },
      });
    });

    it("should return details for SerializedError", () => {
      const error: SerializedError = {
        name: "Error",
        message: "Something went wrong",
        stack: "Error stack trace",
      };

      const details = getErrorDetails(error);
      expect(details).toEqual({
        name: "Error",
        message: "Something went wrong",
        stack: "Error stack trace",
      });
    });
  });

  describe("shouldRetry", () => {
    it("should not retry after max attempts", () => {
      const error: FetchBaseQueryError = {
        status: 500,
        data: undefined,
      };

      expect(shouldRetry(error, 3, 3)).toBe(false);
      expect(shouldRetry(error, 4, 3)).toBe(false);
    });

    it("should not retry client errors (4xx)", () => {
      const error400: FetchBaseQueryError = {
        status: 400,
        data: undefined,
      };

      expect(shouldRetry(error400, 1, 3)).toBe(false);

      const error404: FetchBaseQueryError = {
        status: 404,
        data: undefined,
      };

      expect(shouldRetry(error404, 1, 3)).toBe(false);
    });

    it("should retry server errors (5xx)", () => {
      const error500: FetchBaseQueryError = {
        status: 500,
        data: undefined,
      };

      expect(shouldRetry(error500, 1, 3)).toBe(true);

      const error502: FetchBaseQueryError = {
        status: 502,
        data: undefined,
      };

      expect(shouldRetry(error502, 2, 3)).toBe(true);
    });

    it("should retry network errors", () => {
      const networkError: FetchBaseQueryError = {
        status: "FETCH_ERROR",
        error: "Network error",
      };

      expect(shouldRetry(networkError, 1, 3)).toBe(true);

      const timeoutError: FetchBaseQueryError = {
        status: "TIMEOUT_ERROR",
        error: "Timeout",
      };

      expect(shouldRetry(timeoutError, 2, 3)).toBe(true);
    });
  });

  describe("getRetryDelay", () => {
    it("should calculate exponential backoff correctly", () => {
      expect(getRetryDelay(0, 1000)).toBe(1000);
      expect(getRetryDelay(1, 1000)).toBe(2000);
      expect(getRetryDelay(2, 1000)).toBe(4000);
      expect(getRetryDelay(3, 1000)).toBe(8000);
    });

    it("should cap delay at maximum", () => {
      expect(getRetryDelay(10, 1000)).toBe(10000); // Max 10 seconds
    });

    it("should use default base delay", () => {
      expect(getRetryDelay(1)).toBe(2000); // Default base is 1000ms
    });
  });
});
