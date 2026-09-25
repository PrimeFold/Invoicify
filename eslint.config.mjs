import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Demote experimental React 19 compiler rule that breaks on standard client mount & shadcn hooks
      "react-hooks/set-state-in-effect": "warn",
      // Allow 'any' where needed for WebGL/third-party canvas libs without blocking CI
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow natural contractions (don't, can't) in JSX
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/generated/**",
  ]),
]);

export default eslintConfig;
