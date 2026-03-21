import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ddskitchen.app',
  appName: "DD's Kitchen",
  webDir: 'out',
  server: {
    // 🚀 FULL SAAS MODE: The mobile app loads your LIVE Netlify site
    // This makes your app "Auto-Updating" - any change on GitHub shows up in the app instantly!
    url: "https://ddskitchen.netlify.app/",
    cleartext: true
  }
};

export default config;
