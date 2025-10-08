import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  {
    ignores: [
      "dist/**", // ignore everything inside dist
      "supabase/functions/**", // ignore everything inside supabase
      "node_modules/**", // always good to ignore this too
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. React first & Other third-party packages
            ["^react", "^@?\\w"],

            // 2. @/types, @/interfaces, @/constants, @/assets, @/path
            [
              "^@/assets",
              // "^@/types",
              // "^@/interfaces",
              // "^@/constants",
              // "^@/path",
            ],

            // 3. @/services
            // ["^@/services"],

            // 4. @/hooks, @/utils,
            ["^@/hooks", "^@/libs", "^@/store"],

            // 5. @/layouts and @/providers
            [
              // "^@/layouts",
              "^@/providers",
            ],

            // 6. @/pages
            ["^@/pages"],

            // 7. @/components (including internal subcomponents)
            ["^@/components", "^@/components/.+"],

            // 8. SCSS files
            ["^.+\\.scss$"],

            // 9. Parent imports (../)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],

            // 10. Current directory imports (./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  }
);
