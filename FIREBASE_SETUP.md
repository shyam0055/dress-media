# 🔥 Firebase Setup Guide — DressSwipe

Follow these steps ONCE to get Firebase connected.

---

## Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it **"dresswipe"** → Continue
4. Disable Google Analytics (optional for MVP) → **Create project**

---

## Step 2: Enable Authentication

1. In Firebase console → click **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click **Email/Password** → Enable the first toggle → **Save**

---

## Step 3: Create Firestore Database

1. Click **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for MVP development)
4. Select a region close to you (e.g., `asia-south1` for India) → **Done**

---

## Step 4: Create Firebase Storage

1. Click **Storage** (left sidebar)
2. Click **"Get started"**
3. Choose **"Start in test mode"** → Next → **Done**

---

## Step 5: Get Client SDK Config (for React)

1. In Firebase console → Project settings (⚙️ icon)
2. Scroll to **"Your apps"** → Click **"</>  Web"**
3. Name it "dresswipe-web" → **Register app**
4. Copy the `firebaseConfig` object values

5. Create `client/.env` from the template:
   ```
   copy client\.env.example client\.env
   ```
6. Fill in all `VITE_FIREBASE_*` values from the config

---

## Step 6: Get Admin SDK Service Account (for Express server)

1. In Firebase console → Project settings → **Service accounts** tab
2. Click **"Generate new private key"** → **Generate key**
3. A JSON file downloads. **Keep it safe! Never commit it!**
4. Run this PowerShell command to encode it:
   ```powershell
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("C:\path\to\your-serviceAccount.json")) | Set-Content "server\encoded.txt"
   ```
5. Open `server\encoded.txt`, copy the entire content
6. Create `server/.env` from the template:
   ```
   copy server\.env.example server\.env
   ```
7. Paste the encoded content as `FIREBASE_SERVICE_ACCOUNT_BASE64=<paste here>`
8. Set `FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com`

---

## Step 7: Make Yourself Admin

After registering in the app, run this in Firebase console → Firestore:
1. Go to **Firestore Database**
2. Click `users` collection → find your user document
3. Click the `role` field → change `"user"` to `"admin"`
4. Save

Now you can access the Admin Panel in the app!

---

## Step 8: Run the App

```powershell
# From the dress-media root folder:
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health
