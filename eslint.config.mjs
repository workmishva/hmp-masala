import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Standard React pattern: async data-fetch functions called inside useEffect
      // (e.g. fetchCart, loadStats, refresh) — these are intentional and correct.
      "react-hooks/set-state-in-effect": "off",
      // Unused variables / imports cleaned up below; suppress remaining false positives
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_|^Types$" }],
    },
  },
]);

export default eslintConfig;
