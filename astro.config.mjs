import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://lceoliu.github.io/codex-fixbook";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  srcDir: "./site/src",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()]
});

