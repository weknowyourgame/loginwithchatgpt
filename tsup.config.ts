import { defineConfig } from "tsup";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";

export default defineConfig({
  entry: {
    "core/index": "src/core/index.ts",
    "react/index": "src/react/index.ts",
    "next/index": "src/next/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  // Keep "use client" so the React entry works in Next App Router (RSC).
  esbuildPlugins: [
    preserveDirectivesPlugin({ directives: ["use client"], include: /\.(ts|tsx)$/, exclude: /node_modules/ }),
  ],
});
