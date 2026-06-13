import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    port: 5173,
    open: true,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-window"],
  },
  build: {
    sourcemap: false,
  },
});