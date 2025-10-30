# Deployment Guide for GitHub Pages

## Prerequisites

Before deploying to GitHub Pages, ensure you have:
1. A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Repository with GitHub Pages enabled

## Setup Steps

### 1. Add Your API Key as a GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `GEMINI_API_KEY`
5. Value: Your actual Gemini API key
6. Click **Add secret**

### 2. Enable GitHub Pages

1. Go to your repository **Settings** > **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

### 3. Deploy

The deployment will automatically trigger when you:
- Push to the `main` branch
- Manually trigger the workflow from the **Actions** tab

### 4. Access Your App

After deployment completes (usually 2-3 minutes), your app will be available at:
```
https://<your-github-username>.github.io/<your-repository-name>/
```

For this repository:
```
https://royalgreen65-ui.github.io/conversations-with-the-divine-/
```

## Troubleshooting

### API Key Not Working
- Verify the secret name is exactly `GEMINI_API_KEY`
- Make sure you copied the entire API key without extra spaces
- Check the Actions logs for any build errors

### 404 Error After Deployment
- Ensure GitHub Pages is enabled and set to "GitHub Actions"
- Check that the deployment completed successfully in the Actions tab
- Wait a few minutes for DNS propagation

### Build Failures
- Check the Actions tab for detailed error logs
- Ensure all dependencies are properly listed in package.json
- Verify the API key secret is set correctly

## Local Development

For local development:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Run the development server:
   ```bash
   npm install
   npm run dev
   ```

## Security Notes

⚠️ **CRITICAL SECURITY WARNING**: 

**Your API key will be publicly visible in the deployed application!**

When you build a client-side application with an embedded API key:
- Anyone can view your JavaScript source code in their browser
- Your API key will be visible to anyone who inspects the network requests or source
- Malicious users could extract and abuse your API key
- This could lead to unexpected charges or quota exhaustion on your Google Cloud account

**Recommended Production Security Measures:**
1. **API Key Restrictions**: In Google Cloud Console, restrict your API key to:
   - Specific HTTP referrers (your GitHub Pages domain)
   - Specific APIs (only Gemini API)
   - Set usage quotas to prevent abuse

2. **Backend Proxy (Recommended)**: For production applications, implement a backend server that:
   - Keeps the API key secret on the server
   - Validates and rate-limits requests
   - Proxies calls to the Gemini API
   - Adds authentication for your users

3. **Monitoring**: Regularly check your API usage in Google AI Studio to detect any unusual activity

**For Development/Demo Purposes Only**: This client-side deployment pattern is suitable for:
- Personal projects and demos
- Learning and experimentation
- Prototypes and proof-of-concepts
- Applications with proper API key restrictions set

⚠️ **Remember**: 
- Never commit your `.env` file to git (now properly excluded in `.gitignore`)
- The API key in your deployed app is embedded during build time from GitHub Secrets
- Consider the security implications before sharing your deployed app publicly

## Next Steps

After successful deployment:
1. Test your app at the GitHub Pages URL
2. Share the URL with others
3. Monitor your API usage in Google AI Studio
4. Consider setting up a custom domain (optional)
