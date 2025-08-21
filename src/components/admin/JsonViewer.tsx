"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface JsonViewerProps {
  data: any;
  name?: string;
  expanded?: boolean;
  level?: number;
}

export function JsonViewer({
  data,
  name,
  expanded = false,
  level = 0,
}: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = async (value: any, path: string) => {
    try {
      const textToCopy =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getValueType = (value: any): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  const getValueColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600";
      case "number":
        return "text-blue-600";
      case "boolean":
        return "text-purple-600";
      case "null":
        return "text-gray-500";
      case "array":
        return "text-orange-600";
      case "object":
        return "text-indigo-600";
      default:
        return "text-gray-900";
    }
  };

  const renderValue = (value: any, key: string, currentPath: string) => {
    const type = getValueType(value);
    const colorClass = getValueColor(type);

    if (type === "object" && value !== null) {
      const keys = Object.keys(value);
      return (
        <div className="ml-4">
          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span className="text-gray-600">{key}:</span>
              <span className={colorClass}>
                {`{${keys.length} ${
                  keys.length === 1 ? "property" : "properties"
                }}`}
              </span>
            </button>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(value, currentPath)}
              className="p-1 h-6 w-6"
            >
              {copiedPath === currentPath ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-200 pl-4">
              {keys.map((objKey) => (
                <JsonViewer
                  key={objKey}
                  data={value[objKey]}
                  name={objKey}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (type === "array") {
      return (
        <div className="ml-4">
          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span className="text-gray-600">{key}:</span>
              <span className={colorClass}>
                {`[${value.length} ${value.length === 1 ? "item" : "items"}]`}
              </span>
            </button>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(value, currentPath)}
              className="p-1 h-6 w-6"
            >
              {copiedPath === currentPath ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-200 pl-4">
              {value.map((item: any, index: number) => (
                <JsonViewer
                  key={index}
                  data={item}
                  name={`[${index}]`}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Primitive values
    return (
      <div className="flex items-center gap-2 py-1 ml-4">
        <span className="text-sm text-gray-600">{key}:</span>
        <span className={`text-sm font-mono ${colorClass}`}>
          {type === "string" ? `"${value}"` : String(value)}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
          {type}
        </span>
        <Button
          variant="secondary"
          onClick={() => copyToClipboard(value, currentPath)}
          className="p-1 h-6 w-6"
        >
          {copiedPath === currentPath ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  };

  const currentPath = name || "root";

  if (level === 0) {
    // Root level
    return (
      <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
        {typeof data === "object" && data !== null
          ? Object.keys(data).map((key) => (
              <JsonViewer key={key} data={data[key]} name={key} level={1} />
            ))
          : renderValue(data, "value", currentPath)}
      </div>
    );
  }

  return renderValue(data, name || "", currentPath);
}

export default JsonViewer;
