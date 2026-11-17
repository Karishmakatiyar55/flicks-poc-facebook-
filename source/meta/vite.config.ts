import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

// The app source is kept exactly as it is in Lovable, where files in public/ are addressed from
// the site root ("/logos/x.webp"). GitHub Pages serves the site from /<repo>/, so at build time
// those root paths are made relative to the page. Nothing else in the source is touched.
const relativePublicPaths = (): Plugin => ({
  name: "relative-public-paths",
  enforce: "pre",
  transform(code, id) {
    if (!/\/src\/.*\.(ts|tsx)$/.test(id)) return;
    return code.replace(/(["'`])\/(logos\/|flick-thumbs\/|landing\/|landing-previews\/|flick-frame\.html)/g, "$1$2");
  },
});

// Lovable keeps some media (videos, posters) on its own servers and leaves a "*.asset.json"
// pointer in the source. Those server addresses do not exist on GitHub Pages, so the real files
// are kept in public/lovable-assets/<asset_id>/<filename> and each pointer is resolved to that
// copy. The build fails loudly if a pointed-to file is missing; it never substitutes one.
const lovableAssets = (): Plugin => ({
  name: "lovable-assets",
  enforce: "pre",
  load(id) {
    if (!id.endsWith(".asset.json")) return;
    const pointer = JSON.parse(fs.readFileSync(id, "utf8"));
    const rel = `lovable-assets/${pointer.asset_id}/${pointer.original_filename}`;
    const file = path.resolve(__dirname, "public", rel);
    if (!fs.existsSync(file)) throw new Error(`Missing Lovable asset for ${path.basename(id)}: expected ${file}`);
    if (fs.statSync(file).size !== pointer.size) throw new Error(`Size mismatch for ${rel}: pointer says ${pointer.size}`);
    return JSON.stringify({ ...pointer, url: rel });
  },
});

export default defineConfig({
  base: "./",
  plugins: [lovableAssets(), relativePublicPaths(), react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
