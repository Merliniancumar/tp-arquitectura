export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["<rootDir>/test/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
  coverageProvider: "v8",
};
