
# 🚀 Deployment Guide

Since this is a full-stack application with a Database and AI Models, it requires **two separate deployments**:

1.  **Backend (API + AI)**: Deployed on **Render** (Free Web Service).
2.  **Frontend (UI)**: Deployed on **Vercel** (Free).

---

## Part 1: Backend Deployment (Render)

We use Render because it allows persistent servers for our AI models (unlike Vercel Functions which would timeout).

1.  **Sign Up/Login** to [Render.com](https://render.com/).
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configure the Service**:
    *   **Name**: `lenskart-ai-backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Instance Type**: Free
5.  **Environment Variables** (Scroll down to "Environment"):
    Add the keys from your `.env` file:
    *   `MONGO_URI`: (Your MongoDB Atlas connection string)
    *   `GEMINI_API_KEY`: (Your Gemini API Key)
    *   `PORT`: `10000` (Render's default port)
6.  Click **"Create Web Service"**.
7.  **Wait**: It will deploy and give you a URL like `https://lenskart-ai-backend.onrender.com`. **Copy this URL.**

---

## Part 2: Frontend Deployment (Vercel)

1.  **Sign Up/Login** to [Vercel.com](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Framework**: It should auto-detect "Vite".
    *   **Root Directory**: Click "Edit" and select `client`. (Important!)
5.  **Build Command**: `npm run build` (Default is fine).
6.  **Environment Variables**:
    *   We need to tell the frontend where the backend is.
    *   Since we hardcoded `localhost:3000` in the demo, **we need to update the code first** (see Step 3 below).
    *   Normally, you would set `VITE_API_URL` here.

---

## Part 3: Connecting Frontend to Backend

Before deploying the frontend, we must update `App.tsx` and `ProductCard.tsx` to use the production backend URL instead of localhost.

**Update `client/src/App.tsx` and `ProductCard.tsx`:**
Replace `http://localhost:3000` with your new Render URL (e.g., `https://lenskart-ai-backend.onrender.com`).

**Recommended**: Use an environment variable.
1.  In code: replace string with `import.meta.env.VITE_API_URL`.
2.  In Vercel: Add `VITE_API_URL` = `https://lenskart-ai-backend.onrender.com`.

---

## ⚠️ Important Note on "Reset Data"

On the deployed version, **do NOT click "Reset Data" multiple times.**
Because Render Free Tier puts the server to sleep when inactive, the first request might take 60 seconds. Also, the "Reset Data" process uses heavy CPU for AI embeddings. It's better to ingest data **locally** (on your laptop) and just let the production server **read** from the database.
