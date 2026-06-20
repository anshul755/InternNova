import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("country-state-city")) {
              return "vendor-location";
            }
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }
            if (id.includes("gsap")) {
              return "vendor-gsap";
            }
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-ui-design";
            }
            return "vendor-core";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
