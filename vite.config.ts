import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// The browser cannot call the Jobber backend directly: the services set no CORS headers, and the
// custom `X-User-Sub` header would trigger a preflight the gateway rejects. So in dev we proxy two
// same-origin prefixes to the backend, keeping every request same-origin (no CORS involved):
//   /gw/*      -> the Spring Cloud Gateway (resumes + jobs)
//   /scraper/* -> ScraperService directly (its /api/scrape trigger is NOT gateway-routed)
// Override the targets with VITE_GATEWAY_TARGET / VITE_SCRAPER_TARGET if your hosts differ.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gateway = env.VITE_GATEWAY_TARGET ?? "http://localhost:8080";
  const scraper = env.VITE_SCRAPER_TARGET ?? "http://localhost:8082";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    server: {
      port: 5173,
      proxy: {
        "/gw": {
          target: gateway,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/gw/, ""),
        },
        "/scraper": {
          target: scraper,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/scraper/, ""),
        },
      },
    },
  };
});
