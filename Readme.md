to see the mobile responsive design, please visit the site in mobile the link is:
<a href="https://ashutosh3021.github.io/stunning-fishstick/prototype_mobile/code_home.html">link</a>
to see the desktop responsive design, please visit the site in desktop the link is:
<a href="https://ashutosh3021.github.io/stunning-fishstick/prototype_desktop/code_landing.html">link</a>

**Note on Automatic Device Detection:**
The project now includes a robust smart redirect mechanism at the root [index.html](https://ashutosh3021.github.io/stunning-fishstick/index.html). Visiting the root URL will automatically serve the correct UI bundle (Mobile or Desktop) based on your device's viewport, User-Agent, and touch capabilities.

---

### **Production Deployment (GitHub Pages)**

This project is configured for deployment to GitHub Pages. To deploy the static prototype:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Deploy to GitHub Pages**:
    ```bash
    npm run deploy
    ```
    This command will automatically:
    - Build the project into a `build/` directory.
    - Push the contents of the `build/` directory to a new `gh-pages` branch.
    - GitHub will then automatically host the site at `https://ashutosh3021.github.io/stunning-fishstick`.

### **⚠️ Important: Gemini AI on GitHub Pages**

**GitHub Pages is a static hosting platform.** This means it cannot run the Node.js backend (`server.js`) required for secure Gemini API integration.

-   **When deployed on GitHub Pages**: The chatbot's local rule-based responses (e.g., "Is it free?") will work, but the AI-generated responses (Gemini) will fail because there is no backend to make the API call.
-   **For full AI functionality**: You should deploy this project on a platform that supports Node.js (like **Vercel**, **Railway**, or **Heroku**) or use a separate backend for the API.
-   **Local Testing**: You can still test the full AI functionality locally by running `npm start` and ensuring your `.env` file is correctly configured.

