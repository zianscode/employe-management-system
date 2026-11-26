import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ignores: ["src/shared/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:radix-ui(?:/|$)|@radix-ui/)",
              message: "Use a shadcn/ui component from @/shared/components/ui.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
