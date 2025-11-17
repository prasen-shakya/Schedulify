import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,

    // Vitest must also be told about aliases here
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  esbuild: {
    jsx: "automatic",
  },
});
