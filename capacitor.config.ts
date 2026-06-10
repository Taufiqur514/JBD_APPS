import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jbdcommerce.prototype",
  appName: "JBD Commerce",
  webDir: "capacitor-www",
  server: {
    url: "https://app.ptskb.co.id/",
    cleartext: false,
  },
};

export default config;
