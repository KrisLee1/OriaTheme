import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: "latest", sourceType: "module" }, globals: { TextEncoder: "readonly", Document: "readonly", ShadowRoot: "readonly", HTMLElement: "readonly", HTMLDivElement: "readonly", HTMLInputElement: "readonly", HTMLTextAreaElement: "readonly", HTMLButtonElement: "readonly", Event: "readonly" } },
    rules: {
      "no-restricted-globals": ["error", "window", "document", "localStorage", "matchMedia"],
      "no-undef": "error"
    }
  },
  { ignores: ["**/dist/**", "**/node_modules/**"] }
];
