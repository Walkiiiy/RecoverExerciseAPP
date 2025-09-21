# RecoverExerciseAPP - Expo Build Guide (Python Removed)

This project is now a pure Expo/React Native app. The previous Python backend and Chaquopy integration have been removed.

## Overview

The app integrates:
- **React Native Frontend**: Exercise tracking and video playback
- Mocked scoring service for local development (no native dependencies)

## Project Structure

```
RecoverExerciseAPP/
├── app/                          # React Native screens
├── components/                   # React Native components
├── services/                     # JS-only service (mocked)
├── android/                      # Android native project (standard Expo)
└── assets/                       # Static assets
```

## Key Components

### 1. Service Layer

**File**: `services/PythonService.ts`
- JS-only stub returning mock data (no native module, no Python)

## Build Instructions

### Prerequisites

1. **Node.js 20+** (required for Expo SDK 53)
2. **Expo CLI**: `npm install -g @expo/cli`

### Run in development

```bash
npm install
npm start
```

- Press `a` for Android emulator, `i` for iOS simulator, or open in Expo Go.

### Build with EAS

```bash
npx eas build --platform android --profile preview
```

## Troubleshooting

- If you previously built with native Python/Chaquopy, ensure you’ve removed the plugin and Python blocks from Gradle (already done in this repo).
- Clear Metro cache if you see stale references:
```bash
rm -rf node_modules .expo .gradle android/.gradle && npm install && npm start -c
```

## Notes

- Exercise scoring uses mocked data in development.
- No Python runtime is included; APK size is significantly smaller.
