module.exports = {
    rootDir: __dirname,
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],   // or "**/tests/**/*.test.js"
    moduleFileExtensions: ["js", "json", "node"],
    // optional: keep Jest away from frontend
    modulePathIgnorePatterns: ["<rootDir>/../frontend", "<rootDir>/frontend"],
};
