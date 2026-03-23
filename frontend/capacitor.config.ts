import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isperp.app',
  appName: 'ISP ERP',
  webDir: 'dist',
  server: {
    // للتطوير: اكتب عنوان IP الخاص بالسيرفر هنا
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
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
