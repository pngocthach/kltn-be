import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  target: "node18",
  noExternal: ["fs", "path", "os"], // Giữ nguyên các module Node.js
  platform: "node",
  shims: true, // Thêm shims cho các module không tương thích
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    };
  },
});
