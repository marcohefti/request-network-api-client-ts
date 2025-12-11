import path from "node:path";
import eslintJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import eslintComments from "eslint-plugin-eslint-comments";
import sonarjs from "eslint-plugin-sonarjs";

const tsconfigPath = "./tsconfig.json";

const dotSuffixPlugin = {
  rules: {
    "enforce-dot-suffix": {
      meta: {
        type: "problem",
        docs: {
          description: "Enforce file names to use dot-suffix convention (e.g., feature.facade.ts)"
        },
        schema: []
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            if (filename === "<input>") {
              return;
            }

            const normalized = filename.replace(/\\/g, "/");
            if (!normalized.endsWith(".ts")) {
              return;
            }

            if (normalized.includes("/tests/")) {
              return;
            }

            if (normalized.includes("src/generated/openapi-types.ts")) {
              return;
            }

            const basename = path.basename(normalized, ".ts");
            if (basename === "index") {
              return;
            }

            const pattern = /^(?:[a-z0-9-]+)(?:\.[a-z0-9-]+)+$/;
            if (!pattern.test(basename)) {
              context.report({
                node,
                message: "Filename '{{name}}' must include at least one dot suffix (e.g., 'feature.facade.ts').",
                data: {
                  name: path.basename(normalized)
                }
              });
            }
          }
        };
      }
    }
  }
};

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "src/generated/openapi-types.ts", "src/validation/generated/**"]
  },
  eslintJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: tsconfigPath,
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigPath,
          tsconfigRootDir: import.meta.dirname
        }
      }
    },
    plugins: {
      import: importPlugin,
      "eslint-comments": eslintComments,
      sonarjs,
      "dot-filename": dotSuffixPlugin
    },
    rules: {
      "no-console": "warn",
      "no-void": [
        "error",
        {
          allowAsStatement: true
        }
      ],
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"]
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      "import/no-cycle": "error",
      "import/no-absolute-path": "error",
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            "**/src/index",
            "**/src/core/**",
            "**/src/validation/**",
            "**/src/generated/**",
            "**/src/domains/*",
            "**/src/domains/**",
            "**/src/domains/*/*.facade",
            "**/src/domains/*/*.ports",
            "**/src/domains/*/*.errors",
            "**/src/request.client",
            "**/src/support/index",
            "**/src/webhooks/**",
            "**/tests/**",
            "msw/node"
          ]
        }
      ],
      "dot-filename/enforce-dot-suffix": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false
        }
      ],
      "@typescript-eslint/consistent-type-definitions": [
        "error",
        "interface"
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false
          }
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: false
        }
      ],
      "eslint-comments/no-use": [
        "error",
        {
          allow: []
        }
      ],
      "sonarjs/no-duplicate-string": [
        "error",
        {
          threshold: 2
        }
      ],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-lines": [
        "error",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true
        }
      ]
    }
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  prettier
);
