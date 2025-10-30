<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1FCEBazCP8U_CalgQEtYqJaYC_Mzi8wnS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Gemini API key:
   `cp .env.example .env`
   Then edit `.env` and replace `your_gemini_api_key_here` with your actual API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

1. Go to your repository Settings > Secrets and variables > Actions
2. Add a new secret named `GEMINI_API_KEY` with your Gemini API key
3. Push to the `main` branch - the deployment will happen automatically via GitHub Actions
4. Enable GitHub Pages in Settings > Pages, select "GitHub Actions" as the source
