import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    glsl(),
    react(),
  ],
});
