module.exports = {
  env: { browser: true, es2022: true, node: true },
  extends: ["eslint:recommended"],
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-undef": "error"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "api/",
    "scripts/",
    "tests/",
    "**/*.config.*"
  ]
};

