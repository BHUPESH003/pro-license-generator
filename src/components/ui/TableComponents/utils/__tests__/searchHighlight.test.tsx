import React from "react";
import { render } from "@testing-library/react";
import {
  highlightSearchTerm,
  matchesSearchTerm,
  searchInObject,
  getSearchScore,
  filterAndSortSearchResults,
  debounce,
} from "../searchHighlight";

describe("searchHighlight utilities", () => {
  describe("highlightSearchTerm", () => {
    it("highlights single occurrence of search term", () => {
      const result = highlightSearchTerm("Hello world", "world");
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("Hello world");
      expect(container.querySelector("mark")).toHaveTextContent("world");
    });

    it("highlights multiple occurrences of search term", () => {
      const result = highlightSearchTerm(
        "Hello world, wonderful world",
        "world"
      );
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("Hello world, wonderful world");
      expect(container.querySelectorAll("mark")).toHaveLength(2);
    });

    it("is case insensitive", () => {
      const result = highlightSearchTerm("Hello World", "world");
      const { container } = render(<div>{result}</div>);

      expect(container.querySelector("mark")).toHaveTextContent("World");
    });

    it("returns original text when no search term", () => {
      const result = highlightSearchTerm("Hello world", "");
      expect(result).toBe("Hello world");
    });

    it("returns original text when text is empty", () => {
      const result = highlightSearchTerm("", "world");
      expect(result).toBe("");
    });

    it("applies custom highlight class", () => {
      const result = highlightSearchTerm(
        "Hello world",
        "world",
        "custom-highlight"
      );
      const { container } = render(<div>{result}</div>);

      expect(container.querySelector("mark")).toHaveClass("custom-highlight");
    });

    it("escapes special regex characters", () => {
      const result = highlightSearchTerm("Price: $10.99", "$10.99");
      const { container } = render(<div>{result}</div>);

      expect(container.querySelector("mark")).toHaveTextContent("$10.99");
    });

    it("adds title attribute to highlighted terms", () => {
      const result = highlightSearchTerm("Hello world", "world");
      const { container } = render(<div>{result}</div>);

      expect(container.querySelector("mark")).toHaveAttribute(
        "title",
        "Highlighted: world"
      );
    });
  });

  describe("matchesSearchTerm", () => {
    it("returns true for matching string", () => {
      expect(matchesSearchTerm("Hello world", "world")).toBe(true);
    });

    it("returns true for case insensitive match", () => {
      expect(matchesSearchTerm("Hello World", "world")).toBe(true);
    });

    it("returns false for non-matching string", () => {
      expect(matchesSearchTerm("Hello world", "foo")).toBe(false);
    });

    it("returns true when no search term", () => {
      expect(matchesSearchTerm("Hello world", "")).toBe(true);
    });

    it("returns false for null/undefined values", () => {
      expect(matchesSearchTerm(null, "world")).toBe(false);
      expect(matchesSearchTerm(undefined, "world")).toBe(false);
    });

    it("converts non-string values to strings", () => {
      expect(matchesSearchTerm(123, "12")).toBe(true);
      expect(matchesSearchTerm(true, "true")).toBe(true);
    });
  });

  describe("searchInObject", () => {
    const testObject = {
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      active: true,
    };

    it("searches across all fields by default", () => {
      expect(searchInObject(testObject, "john")).toBe(true);
      expect(searchInObject(testObject, "example")).toBe(true);
      expect(searchInObject(testObject, "30")).toBe(true);
      expect(searchInObject(testObject, "true")).toBe(true);
    });

    it("searches only specified fields", () => {
      expect(searchInObject(testObject, "john", ["name"])).toBe(true);
      expect(searchInObject(testObject, "example", ["name"])).toBe(false);
    });

    it("returns true when no search term", () => {
      expect(searchInObject(testObject, "")).toBe(true);
    });

    it("returns false for null/undefined object", () => {
      expect(searchInObject(null as any, "john")).toBe(false);
      expect(searchInObject(undefined as any, "john")).toBe(false);
    });

    it("handles empty searchable fields array", () => {
      expect(searchInObject(testObject, "john", [])).toBe(false);
    });
  });

  describe("getSearchScore", () => {
    const testObject = {
      name: "John Doe",
      email: "john@example.com",
      description: "A person named John",
    };

    it("gives highest score for exact match", () => {
      const score = getSearchScore({ name: "john" }, "john");
      expect(score).toBe(100);
    });

    it("gives high score for starts with match", () => {
      const score = getSearchScore(testObject, "john");
      expect(score).toBeGreaterThan(50);
    });

    it("gives medium score for contains match", () => {
      const score = getSearchScore(testObject, "doe");
      expect(score).toBe(25);
    });

    it("returns 0 for no match", () => {
      const score = getSearchScore(testObject, "xyz");
      expect(score).toBe(0);
    });

    it("returns 0 when no search term", () => {
      const score = getSearchScore(testObject, "");
      expect(score).toBe(0);
    });

    it("accumulates scores across multiple fields", () => {
      const score = getSearchScore(testObject, "john");
      expect(score).toBeGreaterThan(100); // Should match in multiple fields
    });

    it("searches only specified fields", () => {
      const scoreAll = getSearchScore(testObject, "john");
      const scoreName = getSearchScore(testObject, "john", ["name"]);
      expect(scoreAll).toBeGreaterThan(scoreName);
    });
  });

  describe("filterAndSortSearchResults", () => {
    const testData = [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Bob Johnson", email: "bob@test.com" },
      { id: 4, name: "John Smith", email: "johnsmith@example.com" },
    ];

    it("filters data based on search term", () => {
      const result = filterAndSortSearchResults(testData, "john");
      expect(result).toHaveLength(3);
      expect(
        result.every(
          (item) =>
            item.name.toLowerCase().includes("john") ||
            item.email.toLowerCase().includes("john")
        )
      ).toBe(true);
    });

    it("sorts results by relevance score", () => {
      const result = filterAndSortSearchResults(testData, "john");
      // Exact matches should come first
      expect(result[0].name).toBe("John Doe"); // Starts with John
      expect(result[1].name).toBe("John Smith"); // Starts with John
    });

    it("returns all data when no search term", () => {
      const result = filterAndSortSearchResults(testData, "");
      expect(result).toEqual(testData);
    });

    it("returns empty array when no matches", () => {
      const result = filterAndSortSearchResults(testData, "xyz");
      expect(result).toEqual([]);
    });

    it("searches only specified fields", () => {
      const resultAll = filterAndSortSearchResults(testData, "example");
      const resultEmail = filterAndSortSearchResults(testData, "example", [
        "email",
      ]);

      expect(resultAll.length).toEqual(resultEmail.length);
      expect(resultAll.every((item) => item.email.includes("example"))).toBe(
        true
      );
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("delays function execution", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("cancels previous execution when called again", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("first");
      jest.advanceTimersByTime(200);

      debouncedFn("second");
      jest.advanceTimersByTime(200);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith("second");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("can be cancelled manually", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("test");
      debouncedFn.cancel();

      jest.advanceTimersByTime(300);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("preserves function arguments", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("arg1", "arg2", 123);
      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", 123);
    });

    it("preserves function return type", () => {
      const mockFn = jest.fn().mockReturnValue("result");
      const debouncedFn = debounce(mockFn, 300);

      // TypeScript should infer the correct return type
      const result = debouncedFn("test");
      expect(result).toBeUndefined(); // Debounced functions don't return values immediately
    });
  });
});
