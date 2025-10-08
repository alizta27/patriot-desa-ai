import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: ['74ed8634-f56b-4292-b792-b034b050c807-00-3hmnsni41398o.picard.replit.dev']
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
