import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jbdcommerce.prototype",
  appName: "JBD Commerce",
  webDir: "capacitor-www",
  server: {
    url: "http://100.81.217.5:3001/storefront",
    cleartext: true,
  },
};

export default config;
