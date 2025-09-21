#!/bin/bash

# RecoverExerciseAPP - APK Build Script
# This script builds an APK with integrated Python backend

set -e  # Exit on any error

echo "🏗️  Building RecoverExerciseAPP with Python Backend Integration"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ is required. Current version: $(node --version)"
    echo "Please run: nvm use 20"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate native Android project
echo "🔧 Generating native Android project..."
npx expo prebuild --platform android --clean

# Check if Android project was created
if [ ! -d "android" ]; then
    echo "❌ Error: Android project not created"
    exit 1
fi

echo "✅ Android project generated"

# Build APK
echo "🔨 Building APK..."
cd android

# Try debug build first
echo "Building debug APK..."
if ./gradlew assembleDebug; then
    echo "✅ Debug APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Check APK size
    APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo "📊 APK size: $APK_SIZE"
    
    # Try to install if device is connected
    if adb devices | grep -q "device$"; then
        echo "📱 Installing APK on connected device..."
        adb install -r app/build/outputs/apk/debug/app-debug.apk
        echo "✅ APK installed successfully!"
    else
        echo "⚠️  No Android device connected. APK ready for manual installation."
    fi
    
else
    echo "❌ Debug build failed. Trying release build..."
    
    if ./gradlew assembleRelease; then
        echo "✅ Release APK built successfully!"
        echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
        
        # Check APK size
        APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📊 APK size: $APK_SIZE"
        
        # Try to install if device is connected
        if adb devices | grep -q "device$"; then
            echo "📱 Installing APK on connected device..."
            adb install -r app/build/outputs/apk/release/app-release.apk
            echo "✅ APK installed successfully!"
        else
            echo "⚠️  No Android device connected. APK ready for manual installation."
        fi
    else
        echo "❌ Both debug and release builds failed!"
        echo "Please check the error messages above and refer to BUILD_GUIDE.md"
        exit 1
    fi
fi

cd ..

echo ""
echo "🎉 Build completed successfully!"
echo "================================================================"
echo "📱 Your APK with integrated Python backend is ready!"
echo "📖 For more information, see BUILD_GUIDE.md"
echo ""
echo "🔍 To test the Python integration:"
echo "   1. Open the app on your Android device"
echo "   2. Go to an exercise"
echo "   3. Start recording and perform the exercise"
echo "   4. The app will use the embedded Python service for scoring"
echo ""
