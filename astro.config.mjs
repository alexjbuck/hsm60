import { defineConfig } from "astro/config";

// Static output; dynamic bits live in /functions (Cloudflare Pages Functions).
export default defineConfig({ site: "https://hsm60.example.org" });
