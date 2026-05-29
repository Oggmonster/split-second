import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@game": fileURLToPath(new URL("./game", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "@storage": fileURLToPath(new URL("./storage", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
});
