# دليل بناء تطبيقات ISP ERP

## 1. تطبيق الويب (الحالي)
```bash
cd frontend
npm run build
# النتيجة في مجلد dist/
```

---

## 2. تطبيق موبايل Android/iOS (Capacitor)

### المتطلبات:
- **Android:** Android Studio مثبّت
- **iOS:** Xcode مثبّت (macOS فقط)

### خطوات البناء:

```bash
cd frontend

# إضافة منصة Android (مرة واحدة فقط)
npm run cap:add:android

# إضافة منصة iOS (مرة واحدة فقط - يحتاج macOS)
npm run cap:add:ios

# بناء وفتح Android Studio
npm run cap:android

# بناء وفتح Xcode (macOS فقط)
npm run cap:ios
```

### إعداد IP السيرفر للموبايل:
في ملف `capacitor.config.ts`، أزل التعليق عن هذا السطر وضع IP السيرفر:
```typescript
url: 'http://YOUR_SERVER_IP:5173',
cleartext: true,
```

---

## 3. تطبيق ديسكتوب (Electron)

### المتطلبات:
```bash
cd frontend
npm install electron electron-builder --save-dev
```

### تشغيل وضع التطوير:
```bash
npm run electron:dev
```

### بناء تطبيق Windows:
```bash
npm run electron:build:win
# النتيجة في مجلد dist-electron/
```

### بناء تطبيق Mac:
```bash
npm run electron:build:mac
```

### بناء تطبيق Linux:
```bash
npm run electron:build:linux
```

---

## 4. PWA (تثبيت من المتصفح)
التطبيق يعمل كـ PWA تلقائياً بعد `npm run build`.
المستخدمون يمكنهم تثبيته من المتصفح مباشرة على:
- 📱 Android (Chrome)
- 📱 iOS (Safari - "إضافة إلى الشاشة الرئيسية")
- 💻 Windows/Mac/Linux (Chrome/Edge)
