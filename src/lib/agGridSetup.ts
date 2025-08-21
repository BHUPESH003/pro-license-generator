import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register all AG Grid community modules
// This must be called before any AG Grid components are used
if (typeof window !== "undefined") {
  ModuleRegistry.registerModules([AllCommunityModule]);
}
