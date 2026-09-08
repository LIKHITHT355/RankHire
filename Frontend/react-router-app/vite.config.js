import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// This is the build setup for the project.
// It turns on React support and the styling system,
// and runs the local development server on port 5173.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
