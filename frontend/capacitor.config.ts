import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isperp.app',
  appName: 'ISP ERP',
  webDir: 'dist',
  server: {
    url: 'http://192.200.251.111:5173',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff',
  },
};

export default config;
