# VISTA Mobile APK Build Guide

## Prerequisites
- Node.js 18+
- Android Studio (latest version)
- Java JDK 17+
- Android SDK (API 33+)

## Quick Start

### 1. Setup Environment
```bash
chmod +x setup-apk.sh
./setup-apk.sh
```

### 2. Build APK

#### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (for production)
1. Open Android Studio:
   ```bash
   npx cap open android
   ```
2. In Android Studio:
   - Build → Generate Signed Bundle/APK
   - Select "APK"
   - Create new keystore (or use existing)
   - Select "release" build variant
   - Build

APK location: `android/app/build/outputs/apk/release/`

## Configuration

### capacitor.config.ts
- `appId`: Package identifier (`ai.lyc.vista`)
- `appName`: App display name (VISTA)
- `webDir`: Next.js build output directory
- `server.url`: Live Vercel URL (app loads from web)

### Using Static Export (Offline Support)
To bundle the app with static files instead of loading from web:

1. Update `next.config.js`:
   ```javascript
   module.exports = {
     output: 'export',
     // ... existing config
   }
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     // Remove URL to use bundled files
     // url: 'https://...',
   }
   ```

3. Rebuild:
   ```bash
   npm run build
   npx cap copy android
   npx cap sync android
   ```

## Customization

### App Icons
Replace icons in `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Splash Screen
Replace splash images in `android/app/src/main/res/drawable/splash.png`

### App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">VISTA</string>
```

## Troubleshooting

### Build fails with "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/Users/YOUR_USER/Library/Android/sdk
```

### White screen on launch
- Check internet permissions in `AndroidManifest.xml`
- Verify `server.url` is accessible
- Check Android Studio logs (Logcat)

### App crashes on startup
- Run in debug mode to see errors
- Check `android/app/build.gradle` for dependency conflicts
- Ensure all Capacitor plugins are installed

## Publishing to Play Store

1. Generate signed APK (see Release APK steps above)
2. Create Play Console account: https://play.google.com/console
3. Create new app listing
4. Upload APK to Production track
5. Fill in store listing details
6. Submit for review

## CI/CD (GitHub Actions)

See `.github/workflows/build-apk.yml` for automated APK builds on every push.

## Support

For issues:
- Capacitor docs: https://capacitorjs.com/docs
- Android setup: https://developer.android.com/studio
