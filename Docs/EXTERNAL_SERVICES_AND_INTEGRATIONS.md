# External Services & Cloud Integrations Guide

This document provides a comprehensive reference for all external third-party services, APIs, and cloud tools integrated into the WhiteDavid23 Advanced LMS platform.

---

## 1. Cloud Storage & Media: Cloudinary

**Purpose**: Cloud media management for lecture videos, course thumbnail banners, and document resources.

### Configuration (`server/.env`):
```env
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
```

### Implementation Details (`server/config/cloudnary.js` & `server/config/multer.js`):
- **Initialization**: Configures Cloudinary v2 SDK using `v2.config({ cloud_name, api_key, api_secret })`.
- **Multer Memory Storage**: Files are captured into RAM buffers (`multer.memoryStorage()`) with a 1GB limit for videos and 10MB limit for images.
- **Upload Helper Functions**:
  - `uploadVideoToCloudinary(buffer, filename)`: Uses Cloudinary `upload_stream` with `resource_type: "video"`, `chunk_size: 6000000` (6MB chunks) for chunked upload stability.
  - `uploadImageToCloudinary(buffer, filename)`: Uses `resource_type: "image"` with automated thumbnail resizing.
  - `uploadRawFileToCloudinary(buffer, filename)`: Uses `resource_type: "raw"` for storing lecture PDF/Doc attachments.

### API Endpoints:
- `POST /api/video/upload` — Video upload endpoint (Educator only)
- `POST /api/video/upload-image` — Thumbnail upload endpoint (Educator only)
- `POST /api/video/upload-document` — PDF and presentation upload endpoint (Educator only)

---

## 2. Cloud Database: MongoDB Atlas

**Purpose**: Distributed document persistence for users, courses, chapters, lectures, enrollments, purchases, and ratings.

### Configuration (`server/.env`):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/LMS?retryWrites=true&w=majority
```

### Connection Architecture (`server/config/mongodb.js`):
```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};
```

### Healthcheck & Reconnect Guard (`server/app.js`):
- `/api/health` monitors `mongoose.connection.readyState` (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting).
- If the database is disconnected, incoming `/api/*` routes instantly return `503 Service Unavailable` instead of hanging for 10 seconds.

---

## 3. Payment Gateway: Stripe

**Purpose**: Secure student course purchasing and checkout flows.

### Configuration (`server/.env`):
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Workflow:
1. **Checkout Initiation**: Student clicks "Enroll" / "Buy Now" on `/course/:courseId`.
2. **Endpoint**: `POST /api/user/purchase/:courseId` verifies that the student is not already enrolled.
3. **Record Creation**: Creates a `Purchase` record with `status: "completed"` (or links Stripe Session ID).
4. **Access Grant**: Adds `courseId` to `user.enrolledCourses` and initializes a `CourseProgress` document with 0% progress.

---

## 4. Email Delivery Service: Nodemailer & SMTP

**Purpose**: Transactional emails for OTP-based registration, forgot password verification, and course enrollment confirmations.

### Configuration (`server/.env`):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SENDER_EMAIL="WhiteDavid23 LMS <noreply@whitedavid23.org>"
```

### Implementation (`server/config/nodemailer.js` & `server/utils/emailUtils.js`):
- **Transporter**: Uses Nodemailer with TLS on port 587 or SSL on port 465.
- **Beautiful HTML Templates**:
  - `sendRegistrationOTPEmail(email, otp)`: Sends a styled 6-digit verification code with a 10-minute expiry window.
  - `sendPasswordResetEmail(email, otp)`: Secure OTP email for self-service password reset.
  - `sendEnrollmentConfirmationEmail(email, courseName)`: Welcome email upon course purchase.

---

## 5. Bot & Abuse Protection: Google reCAPTCHA

**Purpose**: Protects registration and login forms from automated brute-force attacks and bot spam.

### Configuration (`server/.env`):
```env
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### Utility (`server/utils/recaptchaUtils.js`):
- Function `verifyRecaptcha(token, remoteIp)` makes a POST request to `https://www.google.com/recaptcha/api/siteverify`.
- Returns `{ success: boolean, score: number }` to safely validate user interaction.

---

## 6. HTML5 Video Player Engine: Fluid Player

**Purpose**: Open-source HTML5 video player providing responsive playback controls, HLS/DASH streaming, custom playback rates, and theatre mode.

### Package: `fluid-player` (v3.60.0)

### Configuration (`client/src/components/course/OpenVideoPlayer.jsx`):
```javascript
const player = fluidPlayer(videoRef.current, {
  layoutControls: {
    fillToContainer: true,
    posterImage: poster || false,
    posterImageSize: 'cover',
    playbackRateEnabled: true,
    controlBar: {
      autoHide: true,
      autoHideTimeout: 3,
      animated: true,
      playbackRates: ['x2', 'x1.75', 'x1.5', 'x1.25', 'x1', 'x0.75', 'x0.5']
    },
    allowTheatre: true,
    miniPlayer: { enabled: true, width: 400, height: 225 },
    doubleclickFullscreen: true,
    allowDownload: false,
    primaryColor: '#3b82f6',
    contextMenu: {
      controls: true,
      links: [{ href: '#', label: '📚 Protected Content — WhiteDavid23 LMS' }]
    }
  }
});
```

### Custom Enhancements Added on Top of Fluid Player:
- **Extra Control Toolbar**: Custom Zoom (0.5x to 3.0x) and 90° Screen Rotation controls.
- **Content DRM Protection**: Auto-pauses on window blur with a protective blackout shield.
- **Dynamic Roaming Watermark**: Live student email watermark overlay.

---

## 7. Document Viewer Engine: PDF.js (Mozilla)

**Purpose**: Client-side document lecture viewer that renders PDFs directly into HTML5 `<canvas>` elements with **zero downloadable file exposure**.

### Package: `pdfjs-dist` (v6.4.299)

### Configuration (`client/src/components/course/ProtectedPdfViewer.jsx`):
```javascript
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
```

### Features:
- **Proxy Streaming**: Loads documents via authenticated proxy `/api/lecture/document/:lectureId?token=...`.
- **Canvas Rendering**: Document pages are rasterized onto an HTML5 canvas, completely hiding the original PDF file URL from the browser download manager.
- **Direct Page Jump**: Jump modal and quick shortcuts (`Home`, `End`, `Left/Right`, `j`).
- **Integrated Anti-Screenshot Shield**: Watermark and blackout shield when unfocused.

---

## 8. Deployment Infrastructure: Vercel & Render

| Component | Platform | Configuration Files | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | `client/vite.config.js`, Vercel SPA routing | Fast global CDN edge delivery with automated HTTPS |
| **Backend REST API** | Render | `server/render.yaml`, `server/package.json` | Web service running Node.js Express with automatic branch deployment |
| **Cloud Storage** | MEGA Drive / Cloudinary | Managed in `server/config/` | Media asset hosting |
| **Database** | MongoDB Atlas | Managed in `server/config/mongodb.js` | Managed multi-region cloud cluster |

---

## 9. Third-Party Summary Matrix

| Service | Primary Purpose | Protocol / SDK | Free Tier Limits |
| :--- | :--- | :--- | :--- |
| **MEGA Drive** | Video & document storage | `megajs` (Node.js SDK) | 20 – 50 GB free storage |
| **Cloudinary** | Image & video hosting | `cloudinary` v1.41 | 25 monthly credit units |
| **MongoDB Atlas**| Primary Database | Mongoose ODM v8 | 512 MB Shared M0 Cluster |
| **Stripe** | Payment checkout | Stripe REST API | Pay per transaction |
| **Nodemailer** | Transactional emails | SMTP (Port 587 / 465) | 500 emails/day (Gmail free) |
| **reCAPTCHA** | Anti-bot verification | Google REST verification | 1M calls/month free |
| **Fluid Player** | Video playback UI | Vanilla JS / CSS | 100% Free & Open Source |
| **PDF.js** | Canvas document rendering | Mozilla Web Worker | 100% Free & Open Source |
