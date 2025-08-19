import { NextRequest } from "next/server";

export interface ValidationRule {
  required?: boolean;
  type?:
    | "string"
    | "number"
    | "boolean"
    | "email"
    | "url"
    | "date"
    | "array"
    | "object";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .trim();
}

/**
 * Sanitize HTML input more aggressively
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "") // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "") // Remove embed tags
    .replace(/<link\b[^>]*>/gi, "") // Remove link tags
    .replace(/<meta\b[^>]*>/gi, "") // Remove meta tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize a single field
 */
export function validateField(
  value: any,
  rule: ValidationRule,
  fieldName: string
): any {
  // Handle required fields
  if (
    rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    throw new ValidationError(
      `${fieldName} is required`,
      fieldName,
      "FIELD_REQUIRED"
    );
  }

  // If value is empty and not required, return early
  if (
    !rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    return value;
  }

  // Type validation and conversion
  switch (rule.type) {
    case "string":
      if (typeof value !== "string") {
        throw new ValidationError(
          `${fieldName} must be a string`,
          fieldName,
          "INVALID_TYPE"
        );
      }
      if (rule.sanitize) {
        value = sanitizeString(value);
      }
      break;

    case "number":
      const num = Number(value);
      if (isNaN(num)) {
        throw new ValidationError(
          `${fieldName} must be a number`,
          fieldName,
          "INVALID_TYPE"
        );
      }
      value = num;
      break;

    case "boolean":
      if (typeof value === "string") {
        value = value.toLowerCase() === "true";
      } else if (typeof value !== "boolean") {
        throw new ValidationError(
          `${fieldName} must be a boolean`,
          fieldName,
          "INVALID_TYPE"
        );
      }
      break;

    case "email":
      if (typeof value !== "string" || !isValidEmail(value)) {
        throw new ValidationError(
          `${fieldName} must be a valid email`,
          fieldName,
          "INVALID_EMAIL"
        );
      }
      if (rule.sanitize) {
        value = sanitizeString(value);
      }
      break;

    case "url":
      if (typeof value !== "string" || !isValidURL(value)) {
        throw new ValidationError(
          `${fieldName} must be a valid URL`,
          fieldName,
          "INVALID_URL"
        );
      }
      break;

    case "date":
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new ValidationError(
          `${fieldName} must be a valid date`,
          fieldName,
          "INVALID_DATE"
        );
      }
      value = date;
      break;

    case "array":
      if (!Array.isArray(value)) {
        throw new ValidationError(
          `${fieldName} must be an array`,
          fieldName,
          "INVALID_TYPE"
        );
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value) || value === null) {
        throw new ValidationError(
          `${fieldName} must be an object`,
          fieldName,
          "INVALID_TYPE"
        );
      }
      break;
  }

  // Length validation for strings and arrays
  if (rule.minLength !== undefined) {
    const length =
      typeof value === "string"
        ? value.length
        : Array.isArray(value)
        ? value.length
        : 0;
    if (length < rule.minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${rule.minLength} characters long`,
        fieldName,
        "MIN_LENGTH_ERROR"
      );
    }
  }

  if (rule.maxLength !== undefined) {
    const length =
      typeof value === "string"
        ? value.length
        : Array.isArray(value)
        ? value.length
        : 0;
    if (length > rule.maxLength) {
      throw new ValidationError(
        `${fieldName} must be at most ${rule.maxLength} characters long`,
        fieldName,
        "MAX_LENGTH_ERROR"
      );
    }
  }

  // Numeric range validation
  if (rule.min !== undefined && typeof value === "number" && value < rule.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${rule.min}`,
      fieldName,
      "MIN_VALUE_ERROR"
    );
  }

  if (rule.max !== undefined && typeof value === "number" && value > rule.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${rule.max}`,
      fieldName,
      "MAX_VALUE_ERROR"
    );
  }

  // Pattern validation
  if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
    throw new ValidationError(
      `${fieldName} format is invalid`,
      fieldName,
      "PATTERN_MISMATCH"
    );
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${rule.enum.join(", ")}`,
      fieldName,
      "INVALID_ENUM_VALUE"
    );
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value);
    if (customResult !== true) {
      const errorMessage =
        typeof customResult === "string"
          ? customResult
          : `${fieldName} is invalid`;
      throw new ValidationError(
        errorMessage,
        fieldName,
        "CUSTOM_VALIDATION_ERROR"
      );
    }
  }

  return value;
}

/**
 * Validate an object against a schema
 */
export function validateObject(data: any, schema: ValidationSchema): any {
  if (!data || typeof data !== "object") {
    throw new ValidationError(
      "Data must be an object",
      "root",
      "INVALID_DATA_TYPE"
    );
  }

  const validatedData: any = {};
  const errors: ValidationError[] = [];

  // Validate each field in the schema
  for (const [fieldName, rule] of Object.entries(schema)) {
    try {
      validatedData[fieldName] = validateField(
        data[fieldName],
        rule,
        fieldName
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      } else {
        errors.push(
          new ValidationError(`Validation failed for ${fieldName}`, fieldName)
        );
      }
    }
  }

  // Check for unexpected fields (optional strict mode)
  const allowedFields = Object.keys(schema);
  const providedFields = Object.keys(data);
  const unexpectedFields = providedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (unexpectedFields.length > 0) {
    console.warn(`Unexpected fields provided: ${unexpectedFields.join(", ")}`);
  }

  if (errors.length > 0) {
    // Throw the first error (you might want to collect all errors instead)
    throw errors[0];
  }

  return validatedData;
}

/**
 * Extract and validate JSON body from request
 */
export async function validateRequestBody(
  req: NextRequest,
  schema: ValidationSchema
): Promise<any> {
  try {
    const body = await req.json();
    return validateObject(body, schema);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Invalid JSON body", "body", "INVALID_JSON");
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams(
  req: NextRequest,
  schema: ValidationSchema
): any {
  const { searchParams } = new URL(req.url);
  const params: any = {};

  // Convert URLSearchParams to object
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return validateObject(params, schema);
}

/**
 * Middleware wrapper for input validation
 */
export function withInputValidation(
  bodySchema?: ValidationSchema,
  querySchema?: ValidationSchema
) {
  return function (
    handler: (
      req: NextRequest,
      validatedData: any,
      ...args: any[]
    ) => Promise<Response>
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<Response> => {
      try {
        const validatedData: any = {};

        // Validate request body if schema provided
        if (bodySchema && ["POST", "PUT", "PATCH"].includes(req.method)) {
          validatedData.body = await validateRequestBody(req, bodySchema);
        }

        // Validate query parameters if schema provided
        if (querySchema) {
          validatedData.query = validateQueryParams(req, querySchema);
        }

        return await handler(req, validatedData, ...args);
      } catch (error) {
        if (error instanceof ValidationError) {
          return new Response(
            JSON.stringify({
              success: false,
              message: error.message,
              field: error.field,
              code: error.code,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        console.error("Input validation error:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid input data",
            code: "VALIDATION_ERROR",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    };
  };
}

// Common validation schemas
export const commonSchemas = {
  pagination: {
    page: { type: "number" as const, min: 1 },
    pageSize: { type: "number" as const, min: 1, max: 100 },
  },

  userFilters: {
    filter_email: { type: "string" as const, maxLength: 255, sanitize: true },
    filter_name: { type: "string" as const, maxLength: 255, sanitize: true },
    filter_role: { type: "string" as const, enum: ["admin", "user"] },
    filter_createdAfter: { type: "date" as const },
    filter_createdBefore: { type: "date" as const },
  },

  deviceFilters: {
    filter_status: { type: "string" as const, enum: ["active", "inactive"] },
    filter_os: { type: "string" as const, maxLength: 100, sanitize: true },
    filter_deviceGuid: {
      type: "string" as const,
      maxLength: 100,
      sanitize: true,
    },
    filter_name: { type: "string" as const, maxLength: 255, sanitize: true },
    filter_userEmail: {
      type: "string" as const,
      maxLength: 255,
      sanitize: true,
    },
    filter_licenseKey: {
      type: "string" as const,
      maxLength: 100,
      sanitize: true,
    },
  },

  sorting: {
    sortBy: { type: "string" as const, maxLength: 50, sanitize: true },
    sortDir: { type: "string" as const, enum: ["asc", "desc"] },
  },
};
