import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true, // (optional, lets you use describe/it/expect without imports)
  },
  esbuild: {
    jsx: "automatic", // ensures the new JSX transform is used
  },
});
