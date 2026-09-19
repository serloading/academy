import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);
const compat = new FlatCompat({ baseDirectory: directory });
const config = [{ ignores: [".next/**", "node_modules/**", "next-env.d.ts"] }, ...compat.extends("next/core-web-vitals", "next/typescript")];
export default config;
