"use client";

import React from "react";
import { Button } from "../../Button";

interface FilterActionsProps {
  onClearFilters: () => void;
  exportEnabled: boolean;
  onExport: () => void;
  loading: boolean;
}

export function FilterActions({
  onClearFilters,
  exportEnabled,
  onExport,
  loading,
}: FilterActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={onClearFilters} disabled={loading}>
        Clear Filters
      </Button>
      {exportEnabled && (
        <Button variant="accent" onClick={onExport} disabled={loading}>
          {loading ? "Exporting..." : "Export CSV"}
        </Button>
      )}
    </div>
  );
}

export default FilterActions;
