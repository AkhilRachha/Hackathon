import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This line is the fix. It maps "@" to the "src" directory.
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

