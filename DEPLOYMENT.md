# Deployment Guide for TradeScope AI

This guide covers multiple hosting options for your TradeScope AI application.

## 🔒 Security Implementation

**API keys are now stored securely server-side!** The app uses serverless functions to proxy API calls, keeping your Anthropic API key completely secure. See [SETUP.md](./SETUP.md) for configuration instructions.

**Key Security Features**:
- ✅ API keys stored as environment variables (never in code)
- ✅ Serverless functions proxy all API calls
- ✅ API key never exposed to browser/client
- ✅ No localStorage for API keys

---

## Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest option with automatic deployments from GitHub.

### Steps:

1. **Build the app locally first** (optional, to test):
   ```bash
   npm run build
   ```

2. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

4. **Custom Domain** (optional):
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain

**Pros**: Free tier, automatic HTTPS, CDN, easy deployments  
**Cons**: None for this use case

---

## Option 2: Netlify

Similar to Vercel, great for static sites.

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Custom Domain**:
   - Site settings → Domain management → Add custom domain

**Pros**: Free tier, automatic HTTPS, form handling  
**Cons**: Slightly slower than Vercel

---

## Option 3: GitHub Pages

Free hosting directly from GitHub.

### Steps:

1. **Update vite.config.js** (already done if using the workflow):
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/trademate/' // Change to your repo name, or '/' for custom domain
   })
   ```

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repo on GitHub
   - Settings → Pages
   - Source: GitHub Actions (or select `gh-pages` branch)
   - The workflow will auto-deploy on every push

4. **Access your site**:
   - URL: `https://<username>.github.io/<repo-name>`

**Pros**: Free, integrated with GitHub  
**Cons**: Requires repo to be public (or GitHub Pro), slower builds

---

## Option 4: Cloudflare Pages

Fast and free CDN hosting.

### Steps:

1. **Push to GitHub**

2. **Deploy to Cloudflare Pages**:
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up/login
   - Create a project → Connect to Git
   - Select your repository
   - Build settings:
     - Framework preset: Vite
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Click "Save and Deploy"

**Pros**: Free, very fast CDN, unlimited bandwidth  
**Cons**: Less popular than Vercel/Netlify

---

## Option 5: Traditional Web Hosting (cPanel, etc.)

For shared hosting or VPS.

### Steps:

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Upload dist folder**:
   - Upload all files from the `dist` folder to your web server
   - Usually to `public_html` or `www` directory

3. **Configure server**:
   - Ensure your server serves `index.html` for all routes
   - Add `.htaccess` (Apache) or `nginx.conf` (Nginx) for SPA routing

**Apache .htaccess** (create in dist folder):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx config**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Testing Your Build Locally

Before deploying, test the production build:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test.

---

## Environment Variables (Future Enhancement)

For better security, consider moving API calls to a backend:

1. Create a Vercel/Netlify serverless function
2. Store API key as environment variable
3. Proxy requests through your function
4. Update frontend to call your function instead of Anthropic directly

---

## Quick Comparison

| Platform | Free Tier | Ease | Speed | Best For |
|----------|-----------|------|-------|----------|
| Vercel | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Most users |
| Netlify | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Static sites |
| GitHub Pages | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | Open source |
| Cloudflare | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High traffic |
| Traditional | ❌ | ⭐⭐ | ⭐⭐⭐ | Full control |

---

## Recommended: Start with Vercel

For most users, **Vercel is the best choice** because:
- Zero configuration needed
- Automatic deployments from GitHub
- Free SSL/HTTPS
- Global CDN
- Easy custom domains
- Great developer experience

Just connect your GitHub repo and deploy! 🚀

