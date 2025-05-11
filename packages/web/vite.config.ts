import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "@kltn/contract": path.resolve(__dirname, "../contract/dist"),
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages\/contract/],
    },
    rollupOptions: {
      external: [],
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "localhost.lol",
      "test.localhost.lol",
      "admin.localhost.lol",
      "localhost",
      "test.localhost",
      "admin.localhost",
    ],
  },
});
