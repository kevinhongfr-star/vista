#!/bin/bash
set -e

echo "🚀 VISTA APK Setup"
echo "=================="

# Install Capacitor dependencies
echo "📦 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen @capacitor/status-bar --save

# Initialize Capacitor (if not already done)
echo "🔧 Initializing Capacitor..."
npx cap init --web-dir=out || echo "Capacitor already initialized"

# Add Android platform
echo "📱 Adding Android platform..."
npx cap add android

# Build Next.js static export
echo "🏗️  Building Next.js static export..."
npm run build

# Copy web assets to Android
echo "📋 Copying web assets..."
npx cap copy android

# Sync plugins
echo "🔄 Syncing plugins..."
npx cap sync android

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. In Android Studio: Build → Generate Signed Bundle/APK"
echo "3. Select APK, choose keystore (or create new), select release build"
echo "4. APK will be in: android/app/build/outputs/apk/release/"
echo ""
echo "For debug APK (no signing required):"
echo "  cd android && ./gradlew assembleDebug"
echo "  APK at: android/app/build/outputs/apk/debug/app-debug.apk"
