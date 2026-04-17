import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];