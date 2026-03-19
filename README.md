# InstaSupply Driver App

A React Native delivery driver app built with Expo and Firebase. Drivers can log in, view assigned deliveries, follow an optimised route on a map, and receive push notifications when new deliveries are assigned.

---

## Demo

<video src="screen-20260320-022626.mp4" controls width="320"></video>

---

## Tech Stack

- **React Native** (Expo SDK 55, Managed Workflow)
- **Expo Router** (file-based navigation)
- **@react-native-firebase** (Auth, Firestore, Messaging)
- **expo-notifications** (push notification display)
- **expo-location** (GPS for route origin)
- **react-native-maps** (map view + polyline)
- **Google Maps Directions API** (route optimisation)
- **Firebase Cloud Functions** (Firestore trigger → FCM notification)
- **Zustand** (auth state)
- **EAS Build** (APK generation)

---

## Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (Blaze plan required for Cloud Functions)
- A Google Cloud project with **Maps SDK for Android**, **Maps SDK for iOS**, and **Directions API** enabled

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Upgrade to **Blaze plan** (required for Cloud Functions)

### 2. Enable Authentication

1. Go to **Authentication → Sign-in method**
2. Enable **Email/Password**
3. Enable **Phone**

### 3. Add Android App

1. Go to **Project Settings → Your apps → Add app → Android**
2. Package name: `com.instasupply.driver`
3. Download `google-services.json` → place in project root
4. Add **SHA-1** and **SHA-256** fingerprints (required for Phone auth):
   ```bash
   # For EAS builds, get the fingerprint after running:
   eas credentials
   # Then look under Android → Keystore → SHA-256 Fingerprint
   ```

### 4. Add iOS App (optional)

1. Go to **Project Settings → Your apps → Add app → iOS**
2. Bundle ID: `com.instasupply.driver`
3. Download `GoogleService-Info.plist` → place in project root

### 5. Create Firestore Database

1. Go to **Firestore Database → Create database**
2. Start in **production mode**
3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 6. Firestore Data Structure

```
deliveries/{deliveryId}
  orderId: string        — e.g. "ORD-001"
  customerName: string   — e.g. "Alice Johnson"
  address: string        — full street address
  lat: number            — latitude
  lng: number            — longitude
  status: string         — "pending" | "in_progress" | "completed" | "failed"
  assignedDriverUid: string  — Firebase Auth UID of the driver
  createdAt: number      — Unix timestamp (ms)
  updatedAt: number      — Unix timestamp (ms)

users/{uid}
  fcmToken: string       — set automatically by the app on login
  tokenUpdatedAt: number
```

---

## Environment Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd instasupply

# 2. Copy env template
cp .env.example .env

# 3. Fill in your Firebase and Google Maps values in .env
# (see .env.example for the required keys)
```

**.env values:**

| Variable | Where to find it |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Web API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same page |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Same page |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same page |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same page |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Same page (Web app App ID) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services → Credentials |

---

## Running Locally

```bash
npm install
npx expo start
```

> **Note:** `@react-native-firebase` requires a native build — the app will not run in Expo Go. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or build the APK directly.

---

## Deploying Cloud Functions

```bash
cd functions
npm install
cd ..

# Login to Firebase
firebase login

# Link to your Firebase project
firebase use --add

# Deploy functions only
firebase deploy --only functions
```

---

## Building the APK

```bash
# Login to your Expo account
eas login

# Configure EAS (first time only)
eas build:configure

# Build the preview APK (for testing/submission)
eas build --platform android --profile preview
```

The build runs on Expo's cloud — no local Android SDK needed. Download the APK from the EAS dashboard URL printed after the build completes.

---

## Triggering a Test Push Notification

### Method 1: Add a Delivery via Firebase Console

1. Open [Firestore Console](https://console.firebase.google.com) → your project → **Firestore**
2. Click **Add document** in the `deliveries` collection
3. Set the following fields:

   | Field | Type | Value |
   |---|---|---|
   | `orderId` | string | `TEST-001` |
   | `customerName` | string | `Test Customer` |
   | `address` | string | `123 Main St, Toronto, ON` |
   | `lat` | number | `43.6532` |
   | `lng` | number | `-79.3832` |
   | `status` | string | `pending` |
   | `assignedDriverUid` | string | *(your logged-in driver's Firebase UID)* |
   | `createdAt` | number | *(current Unix timestamp in ms)* |
   | `updatedAt` | number | *(current Unix timestamp in ms)* |

4. Click **Save** — the Cloud Function will trigger within seconds and send a push notification to the driver

> **Get the driver's UID:** Open your app, log in, and check the Firebase Authentication console for the user's UID.

### Method 2: Use the seed script

```bash
# Requires firebase-admin and a service account key
node scripts/seed-delivery.js
```

### Expected notification behaviour

| App state | Behaviour |
|---|---|
| **Foreground** | In-app notification banner appears |
| **Background** | System notification tray notification appears |
| **Killed** | System notification appears; tapping opens the Deliveries screen |

---

## Project Structure

```
instasupply/
├── src/
│   ├── app/
│   │   ├── _layout.tsx          # Root layout + auth guard
│   │   ├── (auth)/
│   │   │   ├── login.tsx        # Email/password login
│   │   │   └── phone-otp.tsx    # Phone number + OTP verification
│   │   └── (app)/
│   │       ├── deliveries.tsx   # Deliveries list screen
│   │       └── route.tsx        # Optimised route + map screen
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── functions/
│   └── src/index.ts             # Cloud Function: onNewDelivery → FCM
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── app.json
├── eas.json
└── .env.example
```

---

## Known Limitations

- Google Directions API supports a maximum of **25 waypoints** per request. For drivers with more than 25 pending deliveries, stops are batched.
- Phone authentication requires the Firebase project to be on the **Blaze (pay-as-you-go)** plan.
- The APK must be built with EAS (not `expo build`) due to `@react-native-firebase` native modules.
- SHA fingerprints from your EAS keystore must be registered in Firebase console for phone auth to work in production builds.
