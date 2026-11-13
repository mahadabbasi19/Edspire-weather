import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => {
  const base = loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_PATH || "/";
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))
    throw new Error(
      "VITE_BASE_PATH must be / or an absolute directory path ending in /.",
    );
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "autoUpdate",
        manifest: {
          name: "WeatherBoard",
          short_name: "WeatherBoard",
          description: "A little clarity for your everyday.",
          theme_color: "#183d39",
          background_color: "#f5f6f8",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}icons/icon-192.png`,
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: `${base}icons/icon-512.png`,
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: `${base}icons/maskable-512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        injectManifest: { globPatterns: ["**/*.{js,css,html,png,svg,woff2}"] },
      }),
    ],
  };
});
