import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts", "api/**/*.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  target: "node18",
  dts: true,
  outDir: "dist",
  bundle: true,
  external: [],
  platform: "node",
  shims: true,
  esbuildOptions(options) {
    // options.banner = {
    //   js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    // };
  },
});
