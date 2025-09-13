const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node", // Use node environment for API tests
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Handle ES modules from node_modules
  transformIgnorePatterns: [
    "node_modules/(?!(bson|mongodb|mongoose|jose)/)"
  ],
  // Use different test environments based on test type
  projects: [
    {
      displayName: "api-tests",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/src/__tests__/api/**/*.test.{js,ts}",
        "<rootDir>/src/__tests__/webhooks/**/*.test.{js,ts}",
        "<rootDir>/src/__tests__/integration/**/*.test.{js,ts}",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transformIgnorePatterns: [
        "node_modules/(?!(bson|mongodb|mongoose|jose)/)"
      ],
    },
    {
      displayName: "component-tests", 
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/src/__tests__/components/**/*.test.{js,jsx,ts,tsx}",
        "<rootDir>/src/__tests__/ui/**/*.test.{js,jsx,ts,tsx}",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
