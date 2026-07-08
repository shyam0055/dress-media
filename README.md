# 👗 DressSwipe — Social E-Commerce Platform

Welcome to **DressSwipe**! This is a desktop-first social media marketplace app where users swipe on dress video reels to wishlist or buy them. 

This repository houses both the frontend (React + Vite) and backend (Node.js + Express) codebases.

---

## 🛠️ Onboarding Quick Start

If you are a new developer onboarding onto the team, follow these steps to get your local development environment up and running.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **Git**
- A **Firebase** developer account

### 2. Installation
Clone the repository and install all project dependencies from the root directory:
```bash
# Clone the repository
git clone <repo-url>
cd dress-media

# Install root concurrently runner
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Firebase Configuration
DressSwipe utilizes Firebase Auth, Firestore NoSQL database, and Admin SDK token exchanges.
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Project Settings** ➔ **Service Accounts**. Generate a new Node.js private key.
3. Open [FIREBASE_SETUP.md](file:///c:/Users/steja/OneDrive/Desktop/dress-media/FIREBASE_SETUP.md) at the project root for step-by-step instructions on setting up your environment variables (`client/.env` and `server/.env`).

---

## 🚀 Running the Application

You can launch both the React frontend and Node.js backend simultaneously from the root directory using:
```bash
npm run dev
```

### Individual Service Commands
If you prefer running the client or server in isolation:
*   **Frontend Client:** Runs at `http://localhost:5173`
    ```bash
    npm run dev:client
    ```
*   **Backend Server API:** Runs at `http://localhost:5000`
    ```bash
    npm run dev:server
    ```

---

## 📁 Project Architecture

The workspace is organized into two isolated main directories:

```text
dress-media/
├── client/                     # React + Vite Client
│   ├── src/
│   │   ├── components/         # Shared UI (ReelCard, Navbar, ThemeToggle)
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # Home, Feed (Reels), Wishlist, Cart, Profile, Admin
│   │   └── services/           # Axios interceptors & API helpers
│   └── tests/                  # Frontend Vitest test suites
│
├── server/                     # Node.js + Express API Server
│   ├── src/
│   │   ├── config/             # Firebase-admin configurations & constants
│   │   ├── controllers/        # Express handlers (auth, dress, user)
│   │   ├── middleware/         # rate-limiters, errorHandlers, verifyToken
│   │   └── routes/             # REST route bindings
│   └── tests/                  # Integration API Jest test suites
```

---

## 🧪 Running Tests

### Frontend Client Tests (Vitest + JSDOM)
```bash
cd client
npm test
```

### Backend Server Tests (Jest + Supertest)
```bash
cd server
npm test
```

---

## 🌐 Deployment Pipeline

*   **Frontend:** Standard SPA deployments to **Vercel**. Env variables must map `VITE_API_URL` pointing to your hosted API.
*   **Backend:** Node.js server container deployments to **Render**. Ensure you configure `FIREBASE_PRIVATE_KEY_B64` containing the base64-encoded service key string in environment settings.
