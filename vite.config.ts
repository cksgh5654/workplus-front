import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target:
          "https://port-0-workplus-back-m84jn4js1a33a574.sel4.cloudtype.app",
      },
    },
  },
});
