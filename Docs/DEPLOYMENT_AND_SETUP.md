# Setup, Configuration & Production Deployment Guide

This document provides a step-by-step guide for installing, configuring, running locally, and deploying the **WhiteDavid23 Advanced LMS** to cloud platforms (Render and Vercel).

---

## 1. System Requirements & Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (v9+) or `yarn`
- **Database**: MongoDB Atlas cloud cluster (or local MongoDB 6+)
- **Cloud Accounts**:
  - **MEGA Drive** account ([mega.nz](https://mega.nz)) for free video cloud hosting
  - **Cloudinary** account ([cloudinary.com](https://cloudinary.com)) for media hosting
  - **Stripe** account ([stripe.com](https://stripe.com)) for card payments
  - **SMTP Provider** (e.g., Gmail App Password or Resend) for transactional OTP emails

---

## 2. Environment Configuration Reference

### 2.1 Backend Environment Variables (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# ==========================================
# 1. Server Core Configuration
# ==========================================
PORT=5000
NODE_ENV=development

# ==========================================
# 2. MongoDB Database Connection
# ==========================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/LMS?retryWrites=true&w=majority

# ==========================================
# 3. Security & JWT
# ==========================================
JWT_TOKEN=your_super_secret_jwt_random_string_here_min_32_chars

# ==========================================
# 4. Frontend Client URL (For CORS & Cookies)
# ==========================================
# In local development:
CLIENT_URL=http://localhost:5173
# In production (example):
# CLIENT_URL=https://lms-white-david23.vercel.app

# ==========================================
# 5. MEGA Drive Cloud Storage (Primary Video Storage)
# ==========================================
MEGA_EMAIL=your_mega_registered_email@example.com
MEGA_PASSWORD=your_mega_account_password
MEGA_API_KEY=
MEGA_FOLDER_NAME=LMS-Drive-Storage

# ==========================================
# 6. Cloudinary Media Storage (Secondary / Fallback)
# ==========================================
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# ==========================================
# 7. Stripe Payment Processing
# ==========================================
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ==========================================
# 8. Transactional Email & SMTP Configuration
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_16_digit_app_password
SENDER_EMAIL="WhiteDavid23 LMS <noreply@whitedavid23.org>"

# ==========================================
# 9. Google reCAPTCHA Bot Protection (Optional)
# ==========================================
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

---

### 2.2 Frontend Environment Variables (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
# URL pointing to the running backend API server
VITE_BACKEND_URL=http://localhost:5000

# Optional Google reCAPTCHA site key for web forms
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

In production, change `VITE_BACKEND_URL` to your live Render backend URL (e.g. `https://lms-api.onrender.com`).

---

## 3. Local Development Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/Aniket0025/LMS-WhiteDavid23.git
cd LMS-WhiteDavid23
```

### Step 2: Set Up Backend Server
```bash
cd server
npm install
# Ensure .env is populated
npm run dev
```
The server will start on port `5000`. You should see:
```text
Server Started on port 5000
Database Connected Successfully
✅ Successfully authenticated and connected to MEGA Drive cloud storage!
```

### Step 3: Set Up Frontend Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
```
Vite will start the client on `http://localhost:5173`. Open your browser to explore the platform.

---

## 4. Production Deployment

### 4.1 Backend Deployment on Render

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repository (`LMS-WhiteDavid23`).
3. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
4. Add all environment variables from `server/.env` into Render's **Environment** tab.
5. Render reverse proxy notes:
   - `server/app.js` already includes `app.set('trust proxy', 1);` for HTTPS cookie forwarding.
   - Server timeout is configured to 10 minutes (`app.timeout = 600000;`) to prevent timeouts during large video uploads.

---

### 4.2 Frontend Deployment on Vercel

1. Create a new Project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Set the following settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_BACKEND_URL`: `https://your-render-backend-url.onrender.com`
5. Single Page Application (SPA) Routing:
   Ensure `client/vercel.json` exists with rewrite rules to redirect all page routes to `/index.html`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 5. Troubleshooting Common Issues

### 1. `503 Service Unavailable: Database is currently unavailable`
- **Cause**: The backend server could not establish a connection to MongoDB Atlas within 5 seconds.
- **Solution**:
  1. Verify `MONGODB_URI` in `.env` / Render environment settings.
  2. In your MongoDB Atlas dashboard, go to **Network Access** and ensure `0.0.0.0/0` (Allow Access from Anywhere) is whitelisted so Render can connect.

### 2. `CORS Policy Blocked`
- **Cause**: The frontend origin is not in the backend's allowed origins list.
- **Solution**:
  In `server/app.js`, CORS dynamically checks `isOriginAllowed()`, supporting `localhost`, `*.vercel.app`, and `CLIENT_URL`. Ensure your frontend Vercel domain is listed in `allowedOrigins` or set in `CLIENT_URL`.

### 3. `Failed to authenticate with MEGA Drive`
- **Cause**: Incorrect email or password in `MEGA_EMAIL` / `MEGA_PASSWORD`.
- **Solution**: Verify credentials by logging into [mega.nz](https://mega.nz) directly in a web browser.

### 4. `Request Entity Too Large / 413 Error`
- **Cause**: Uploading a lecture video larger than default payload limits.
- **Solution**: `server/app.js` is already configured with `express.json({ limit: '600mb' })` and Multer memory limits of 1GB for video files.
