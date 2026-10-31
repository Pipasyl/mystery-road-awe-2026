import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  // PROXY: Vite forwards every address starting with /api to the backend on port 3001.
  // The browser sees only one origin (5173), so CORS never blocks anything.
  server: {
    proxy: {
      "/api/": "http://localhost:3001",
    },
  },
});
