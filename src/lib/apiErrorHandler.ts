import { NextRequest, NextResponse } from "next/server";

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export class ApiErrorHandler {
  static createError(
    message: string,
    code: string,
    status: number = 500,
    details?: any
  ): ApiError {
    return { message, code, status, details };
  }

  static handleError(error: unknown): NextResponse {
    console.error("API Error:", error);

    // Handle known API errors
    if (error instanceof ApiError || (error as any).code) {
      const apiError = error as ApiError;
      return NextResponse.json(
        {
          success: false,
          message: apiError.message,
          code: apiError.code,
          details: apiError.details,
        },
        { status: apiError.status }
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle MongoDB errors
    if (error instanceof Error && error.name === "MongoError") {
      return NextResponse.json(
        {
          success: false,
          message: "Database operation failed",
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    // Handle JWT errors
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }

  static wrapHandler(
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
        return await handler(req, ...args);
      } catch (error) {
        return ApiErrorHandler.handleError(error);
      }
    };
  }

  static validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw ApiErrorHandler.createError(
        `Missing required fields: ${missing.join(", ")}`,
        "MISSING_FIELDS",
        400,
        { missingFields: missing }
      );
    }
  }

  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw ApiErrorHandler.createError(
        "Invalid email format",
        "INVALID_EMAIL",
        400
      );
    }
  }

  static validateId(id: string): void {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      throw ApiErrorHandler.createError("Invalid ID format", "INVALID_ID", 400);
    }
  }

  static validatePagination(page: number, pageSize: number): void {
    if (page < 1) {
      throw ApiErrorHandler.createError(
        "Page must be greater than 0",
        "INVALID_PAGE",
        400
      );
    }

    if (pageSize < 1 || pageSize > 100) {
      throw ApiErrorHandler.createError(
        "Page size must be between 1 and 100",
        "INVALID_PAGE_SIZE",
        400
      );
    }
  }

  static validateSortDirection(direction: string): void {
    if (!["asc", "desc"].includes(direction.toLowerCase())) {
      throw ApiErrorHandler.createError(
        'Sort direction must be "asc" or "desc"',
        "INVALID_SORT_DIRECTION",
        400
      );
    }
  }

  static validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw ApiErrorHandler.createError(
          "Invalid date format",
          "INVALID_DATE",
          400
        );
      }

      if (start > end) {
        throw ApiErrorHandler.createError(
          "Start date must be before end date",
          "INVALID_DATE_RANGE",
          400
        );
      }
    }
  }

  static rateLimit(
    req: NextRequest,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): void {
    // This is a simple in-memory rate limiter
    // In production, you'd want to use Redis or a proper rate limiting service
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const key = `rate_limit_${ip}`;

    // For now, just log the rate limit check
    // In a real implementation, you'd check against a store
    console.log(
      `Rate limit check for ${ip}: ${maxRequests} requests per ${windowMs}ms`
    );
  }
}

// Common error types
export const CommonErrors = {
  UNAUTHORIZED: ApiErrorHandler.createError(
    "Authentication required",
    "UNAUTHORIZED",
    401
  ),
  FORBIDDEN: ApiErrorHandler.createError(
    "Insufficient permissions",
    "FORBIDDEN",
    403
  ),
  NOT_FOUND: ApiErrorHandler.createError(
    "Resource not found",
    "NOT_FOUND",
    404
  ),
  CONFLICT: ApiErrorHandler.createError(
    "Resource already exists",
    "CONFLICT",
    409
  ),
  VALIDATION_ERROR: ApiErrorHandler.createError(
    "Validation failed",
    "VALIDATION_ERROR",
    400
  ),
  INTERNAL_ERROR: ApiErrorHandler.createError(
    "Internal server error",
    "INTERNAL_ERROR",
    500
  ),
};
