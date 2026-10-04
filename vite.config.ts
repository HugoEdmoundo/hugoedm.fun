import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Barrel `lucide-react` melakukan `import * as index from "./icons/index.js"` lalu
 * men-export namespace itu. Satu baris itu membuat Rollup mempertahankan seluruh
 * 3488 ikon (±670 KB) walau paketnya `sideEffects: false`. Tidak ada kode di app ini
 * yang memakai export `icons`, jadi namespace-nya dibuang sebelum di-bundle.
 * Kalau format paket berubah, regex ini tidak match dan bundling kembali seperti semula.
 */
function lucideIconsTreeShake(): Plugin {
  const pattern = /import \* as index from ['"]\.\/icons\/index\.js['"];\s*export \{ index as icons \};\s*/;
  return {
    name: "lucide-icons-treeshake",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("lucide-react") || !id.endsWith("lucide-react.js")) return null;
      if (!pattern.test(code)) return null;
      return { code: code.replace(pattern, ""), map: null };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8990,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), lucideIconsTreeShake()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return "react";
          }
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("lucide-react")) return "icons";
          // sisanya dibiarkan ke chunking default Rollup: dependensi khusus CMS
          // (recharts, react-day-picker, cmdk, vaul, embla) tidak ikut ter-eager-load
          return undefined;
        },
      },
    },
  },
}));
