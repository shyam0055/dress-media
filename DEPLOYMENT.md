# DressSwipe — Free Deployment Guide

This document describes how to deploy the **DressSwipe** full-stack application completely for free using **Vercel** (frontend) and **Render** (backend).

---

## 🛠️ Step 1: Deploy the Backend (to Render)

Render offers a generous free tier for running Node.js web services.

1.  Sign in to **[Render.com](https://render.com/)** using your GitHub account.
2.  Click **New +** ➔ **Web Service**.
3.  Connect your GitHub repository containing the DressSwipe code.
4.  Configure the service details:
    *   **Name:** `dress-media-api`
    *   **Language:** `Node`
    *   **Root Directory:** `server` (Important: points to the backend subfolder)
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
    *   **Instance Type:** `Free`
5.  Open the **Environment** tab and add the following variables:
    *   `NODE_ENV`: `production`
    *   `PORT`: `5000` (Render binds to this automatically)
    *   `FIREBASE_PRIVATE_KEY_B64`: *(Your Base64-encoded Firebase Service Account Key)*
6.  Click **Create Web Service**. 
7.  Once deployed, copy the generated service URL (e.g. `https://dress-media-api.onrender.com`).

---

## 🚀 Step 2: Deploy the Frontend (to Vercel)

Vercel is the optimal hosting platform for free React + Vite single page applications.

1.  Sign in to **[Vercel.com](https://vercel.com/)** using your GitHub account.
2.  Click **Add New** ➔ **Project**.
3.  Import your GitHub repository containing the DressSwipe code.
4.  Configure the build settings:
    *   **Root Directory:** `client` (Important: points to the frontend subfolder)
    *   **Framework Preset:** `Vite` (Auto-detected)
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  Open **Environment Variables** and add the variables from your local `client/.env` file:
    *   `VITE_API_URL`: *(Your Render service API URL copied in Step 1, e.g. `https://dress-media-api.onrender.com`)*
    *   `VITE_FIREBASE_API_KEY`: `...`
    *   `VITE_FIREBASE_AUTH_DOMAIN`: `...`
    *   `VITE_FIREBASE_PROJECT_ID`: `...`
    *   `VITE_FIREBASE_STORAGE_BUCKET`: `...`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`: `...`
    *   `VITE_FIREBASE_APP_ID`: `...`
6.  Click **Deploy**.
7.  Once compiled, copy your live frontend URL (e.g. `https://dress-media.vercel.app`).

---

## 🔒 Step 3: Add CORS Security

To secure your backend against unauthorized requests:
1.  Go back to your **Render Web Service** dashboard.
2.  Navigate to **Environment** settings.
3.  Add the environment variable:
    *   `CLIENT_ORIGIN`: *(Your hosted Vercel URL, e.g. `https://dress-media.vercel.app`)*
4.  Save changes. Render will automatically redeploy with CORS permissions restricted specifically to your frontend domain!

---

## 🔑 How to encode your Firebase Private Key to Base64
Render env variables do not support raw multi-line JSON values. You must encode your Firebase service account JSON key to Base64.

Run this PowerShell command on your local machine to copy the Base64 string directly to your clipboard:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\teja\downloads\dresswipe-f495f-firebase-adminsdk-fbsvc-2630068c9c.json")) | clip
```
Then, paste it into the `FIREBASE_PRIVATE_KEY_B64` field in Render!
