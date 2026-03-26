# CareConnect Deployment Tutorial: Enabling Full AI Functionality

This tutorial explains how to deploy the CareConnect prototype to a platform that supports Node.js (like Vercel) to enable the **Gemini AI Chatbot** in a production environment.

## Prerequisites

-   A **GitHub** account with your project repository uploaded.
-   A **Google Gemini API Key** (obtainable from [Google AI Studio](https://aistudio.google.com/)).
-   Basic familiarity with the terminal.

---

## Why GitHub Pages isn't enough?
GitHub Pages only hosts **static** files (HTML, CSS, JS). Our AI functionality requires a **backend server** (`server.js`) to securely communicate with Google's Gemini API using your private API key. Platforms like Vercel, Railway, or Heroku can run this backend.

---

## Step 1: Prepare your Project for Vercel

The project is now configured with a `vercel.json` file to correctly handle both the frontend static files and the Node.js API. We've updated the build script to generate a `public` directory, which satisfies Vercel's default output expectations.

### **vercel.json Configuration**
We have added a `vercel.json` file that:
- Sets `outputDirectory` to `public`.
- Routes all `/api/*` requests to the `server.js` backend function.
- Serves everything else as static files.

## Step 2: Deploying to Vercel (Recommended)

1.  **Sign up/Log in**: Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2.  **Import Project**: Click **"Add New"** > **"Project"**.
3.  **Connect GitHub**: Select your repository.
4.  **Configure Project**:
    -   **Framework Preset**: Select "Other" (the `vercel.json` will override this anyway).
    -   **Root Directory**: Leave as `./`.
    -   **Build & Output Settings**: Vercel should automatically detect the `npm run build` command and the `public` output directory from our configuration.
5.  **Environment Variables (CRITICAL)**:
    -   Expand the **"Environment Variables"** section.
    -   Add a new variable:
        -   **Key**: `GEMINI_API_KEY`
        -   **Value**: Paste your actual API key from Google AI Studio.
    -   Click **Add**.
6.  **Deploy**: Click the **"Deploy"** button.

## Step 3: Update your Frontend API URL

Currently, the frontend in `app.js` makes requests to `/api/chat`. When deployed on Vercel, this relative path works perfectly as the frontend and backend are hosted together.

```javascript
// From prototype_mobile/app.js or prototype_desktop/app.js
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
});
```

## Step 4: Verification

1.  Once the deployment is finished, Vercel will provide you with a production URL (e.g., `https://careconnect-proto.vercel.app`).
2.  Open the URL and navigate to the **Chat** section.
3.  Ask a question that isn't a placeholder (e.g., "What is the capital of France?").
4.  If the chatbot responds with a detailed answer, your Gemini AI integration is successfully live!

---

## Troubleshooting

### "Gemini API Error" in Console
-   Ensure your `GEMINI_API_KEY` in the Vercel dashboard matches exactly what you got from Google.
-   Check the **Logs** tab in Vercel to see the specific error message from the `server.js` backend.

### Redirection Issues
-   The project uses a smart redirect in `index.html`. Ensure that all files (`prototype_mobile`, `prototype_desktop`, `index.html`) were pushed to your repository.

---

## Alternative: Railway or Heroku
The steps are nearly identical:
1.  Connect your GitHub repository.
2.  Add `GEMINI_API_KEY` to the platform's **Variables** or **Config Vars** section.
3.  The platform will detect `package.json` and run `npm start` automatically.
