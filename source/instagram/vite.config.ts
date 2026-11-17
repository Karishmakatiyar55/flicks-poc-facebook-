import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The app source is kept exactly as it is in Lovable, where files in public/ are addressed from
// the site root ("/logos/x.webp"). GitHub Pages serves the site from /<repo>/, so at build time
// those root paths are made relative to the page. Nothing else in the source is touched.
const relativePublicPaths = (): Plugin => ({
  name: "relative-public-paths",
  enforce: "pre",
  transform(code, id) {
    if (!/\/src\/.*\.(ts|tsx)$/.test(id)) return;
    return code.replace(/(["'`])\/(logos\/|flick-thumbs\/|landing\/|flick-frame\.html)/g, "$1$2");
  },
});

export default defineConfig({
  base: "./",
  plugins: [relativePublicPaths(), react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
