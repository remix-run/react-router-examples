import * as path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Build two separate bundles, one for each app.
      input: {
        main: path.resolve(__dirname, "index.html"),
        inbox: path.resolve(__dirname, "inbox/index.html"),
      },
    },
  },
});
