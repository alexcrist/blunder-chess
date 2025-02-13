import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                404: resolve(__dirname, "404.html"),
            },
        },
    },
});
