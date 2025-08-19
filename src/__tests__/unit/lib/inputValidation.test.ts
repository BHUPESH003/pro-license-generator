import {
  validateField,
  validateObject,
  ValidationError,
  sanitizeString,
  sanitizeHTML,
  isValidEmail,
  isValidURL,
  withInputValidation,
} from "@/lib/inputValidation";
import { NextRequest } from "next/server";

describe("Input Validation", () => {
  describe("sanitizeString", () => {
    it("should remove HTML tags", () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        'alert("xss")'
      );
      expect(sanitizeString("<div>Hello</div>")).toBe("Hello");
    });

    it("should remove dangerous protocols", () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(
        sanitizeString('data:text/html,<script>alert("xss")</script>')
      ).toBe('text/html,alert("xss")');
      expect(sanitizeString('vbscript:msgbox("xss")')).toBe('msgbox("xss")');
    });

    it("should remove event handlers", () => {
      expect(sanitizeString('onclick=alert("xss")')).toBe("");
      expect(sanitizeString("onload=malicious()")).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitizeString("  hello world  ")).toBe("hello world");
    });

    it("should handle non-string input", () => {
      expect(sanitizeString(null as any)).toBe("");
      expect(sanitizeString(undefined as any)).toBe("");
      expect(sanitizeString(123 as any)).toBe("");
    });
  });

  describe("sanitizeHTML", () => {
    it("should remove script tags", () => {
      expect(sanitizeHTML('<script>alert("xss")</script>Hello')).toBe("Hello");
      expect(sanitizeHTML('Before<script src="evil.js"></script>After')).toBe(
        "BeforeAfter"
      );
    });

    it("should remove iframe tags", () => {
      expect(sanitizeHTML('<iframe src="evil.html"></iframe>')).toBe("");
    });

    it("should remove dangerous tags", () => {
      expect(sanitizeHTML('<object data="evil.swf"></object>')).toBe("");
      expect(sanitizeHTML('<embed src="evil.swf">')).toBe("");
      expect(sanitizeHTML('<link rel="stylesheet" href="evil.css">')).toBe("");
      expect(
        sanitizeHTML('<meta http-equiv="refresh" content="0;url=evil.com">')
      ).toBe("");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email formats", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.email+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("user123@test-domain.org")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidURL", () => {
    it("should validate correct URL formats", () => {
      expect(isValidURL("https://example.com")).toBe(true);
      expect(isValidURL("http://localhost:3000")).toBe(true);
      expect(isValidURL("ftp://files.example.com")).toBe(true);
    });

    it("should reject invalid URL formats", () => {
      expect(isValidURL("not-a-url")).toBe(false);
      expect(isValidURL("http://")).toBe(false);
      expect(isValidURL("")).toBe(false);
    });
  });

  describe("validateField", () => {
    it("should validate required fields", () => {
      expect(() =>
        validateField(undefined, { required: true }, "test")
      ).toThrow(
        new ValidationError("test is required", "test", "FIELD_REQUIRED")
      );

      expect(() => validateField("", { required: true }, "test")).toThrow(
        new ValidationError("test is required", "test", "FIELD_REQUIRED")
      );

      expect(() => validateField(null, { required: true }, "test")).toThrow(
        new ValidationError("test is required", "test", "FIELD_REQUIRED")
      );
    });

    it("should allow empty values for non-required fields", () => {
      expect(
        validateField(undefined, { required: false }, "test")
      ).toBeUndefined();
      expect(validateField("", { required: false }, "test")).toBe("");
      expect(validateField(null, { required: false }, "test")).toBeNull();
    });

    it("should validate string type", () => {
      expect(validateField("hello", { type: "string" }, "test")).toBe("hello");
      expect(() => validateField(123, { type: "string" }, "test")).toThrow(
        new ValidationError("test must be a string", "test", "INVALID_TYPE")
      );
    });

    it("should validate number type", () => {
      expect(validateField("123", { type: "number" }, "test")).toBe(123);
      expect(validateField(456, { type: "number" }, "test")).toBe(456);
      expect(() =>
        validateField("not-a-number", { type: "number" }, "test")
      ).toThrow(
        new ValidationError("test must be a number", "test", "INVALID_TYPE")
      );
    });

    it("should validate boolean type", () => {
      expect(validateField(true, { type: "boolean" }, "test")).toBe(true);
      expect(validateField("true", { type: "boolean" }, "test")).toBe(true);
      expect(validateField("false", { type: "boolean" }, "test")).toBe(false);
      expect(() =>
        validateField("not-boolean", { type: "boolean" }, "test")
      ).toThrow(
        new ValidationError("test must be a boolean", "test", "INVALID_TYPE")
      );
    });

    it("should validate email type", () => {
      expect(validateField("user@example.com", { type: "email" }, "test")).toBe(
        "user@example.com"
      );
      expect(() =>
        validateField("invalid-email", { type: "email" }, "test")
      ).toThrow(
        new ValidationError(
          "test must be a valid email",
          "test",
          "INVALID_EMAIL"
        )
      );
    });

    it("should validate string length", () => {
      expect(
        validateField(
          "hello",
          { type: "string", minLength: 3, maxLength: 10 },
          "test"
        )
      ).toBe("hello");

      expect(() =>
        validateField("hi", { type: "string", minLength: 3 }, "test")
      ).toThrow(
        new ValidationError(
          "test must be at least 3 characters long",
          "test",
          "MIN_LENGTH_ERROR"
        )
      );

      expect(() =>
        validateField(
          "very long string",
          { type: "string", maxLength: 5 },
          "test"
        )
      ).toThrow(
        new ValidationError(
          "test must be at most 5 characters long",
          "test",
          "MAX_LENGTH_ERROR"
        )
      );
    });

    it("should validate numeric ranges", () => {
      expect(
        validateField(5, { type: "number", min: 1, max: 10 }, "test")
      ).toBe(5);

      expect(() =>
        validateField(0, { type: "number", min: 1 }, "test")
      ).toThrow(
        new ValidationError(
          "test must be at least 1",
          "test",
          "MIN_VALUE_ERROR"
        )
      );

      expect(() =>
        validateField(15, { type: "number", max: 10 }, "test")
      ).toThrow(
        new ValidationError(
          "test must be at most 10",
          "test",
          "MAX_VALUE_ERROR"
        )
      );
    });

    it("should validate patterns", () => {
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
      expect(
        validateField(
          "123-456-7890",
          { type: "string", pattern: phonePattern },
          "phone"
        )
      ).toBe("123-456-7890");

      expect(() =>
        validateField(
          "invalid-phone",
          { type: "string", pattern: phonePattern },
          "phone"
        )
      ).toThrow(
        new ValidationError(
          "phone format is invalid",
          "phone",
          "PATTERN_MISMATCH"
        )
      );
    });

    it("should validate enum values", () => {
      expect(
        validateField(
          "admin",
          { type: "string", enum: ["admin", "user"] },
          "role"
        )
      ).toBe("admin");

      expect(() =>
        validateField(
          "invalid",
          { type: "string", enum: ["admin", "user"] },
          "role"
        )
      ).toThrow(
        new ValidationError(
          "role must be one of: admin, user",
          "role",
          "INVALID_ENUM_VALUE"
        )
      );
    });

    it("should apply custom validation", () => {
      const customRule = {
        type: "string" as const,
        custom: (value: string) =>
          value.includes("@") || "Must contain @ symbol",
      };

      expect(validateField("user@domain", customRule, "test")).toBe(
        "user@domain"
      );

      expect(() => validateField("invalid", customRule, "test")).toThrow(
        new ValidationError(
          "Must contain @ symbol",
          "test",
          "CUSTOM_VALIDATION_ERROR"
        )
      );
    });

    it("should sanitize strings when requested", () => {
      const rule = { type: "string" as const, sanitize: true };
      expect(
        validateField('<script>alert("xss")</script>hello', rule, "test")
      ).toBe('alert("xss")hello');
    });
  });

  describe("validateObject", () => {
    it("should validate object against schema", () => {
      const schema = {
        name: { type: "string" as const, required: true },
        age: { type: "number" as const, min: 0 },
        email: { type: "email" as const },
      };

      const data = {
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      };

      const result = validateObject(data, schema);
      expect(result).toEqual(data);
    });

    it("should throw error for invalid data", () => {
      const schema = {
        name: { type: "string" as const, required: true },
      };

      expect(() => validateObject({ name: "" }, schema)).toThrow(
        ValidationError
      );
    });

    it("should handle non-object input", () => {
      expect(() => validateObject("not-an-object", {})).toThrow(
        new ValidationError(
          "Data must be an object",
          "root",
          "INVALID_DATA_TYPE"
        )
      );
    });
  });

  describe("withInputValidation", () => {
    const mockHandler = jest.fn().mockResolvedValue(new Response("OK"));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should validate request body for POST requests", async () => {
      const bodySchema = {
        name: { type: "string" as const, required: true },
      };

      const wrappedHandler = withInputValidation(bodySchema)(mockHandler);

      const req = new NextRequest("http://localhost/test", {
        method: "POST",
        body: JSON.stringify({ name: "John" }),
        headers: { "content-type": "application/json" },
      });

      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, { body: { name: "John" } });
    });

    it("should validate query parameters", async () => {
      const querySchema = {
        page: { type: "number" as const },
      };

      const wrappedHandler = withInputValidation(
        undefined,
        querySchema
      )(mockHandler);

      const req = new NextRequest("http://localhost/test?page=1");

      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, { query: { page: 1 } });
    });

    it("should return 400 for validation errors", async () => {
      const bodySchema = {
        name: { type: "string" as const, required: true },
      };

      const wrappedHandler = withInputValidation(bodySchema)(mockHandler);

      const req = new NextRequest("http://localhost/test", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
      });

      const response = await wrappedHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe("FIELD_REQUIRED");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should handle invalid JSON", async () => {
      const bodySchema = {
        name: { type: "string" as const },
      };

      const wrappedHandler = withInputValidation(bodySchema)(mockHandler);

      const req = new NextRequest("http://localhost/test", {
        method: "POST",
        body: "invalid json",
        headers: { "content-type": "application/json" },
      });

      const response = await wrappedHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("INVALID_JSON");
    });
  });
});
