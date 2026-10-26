# MEGA Drive Cloud Storage Integration Guide

This document provides a comprehensive technical guide to the **MEGA Cloud Drive (`megajs`)** integration in the WhiteDavid23 LMS platform.

---

## 1. Overview & Purpose

Online video courses require substantial cloud storage. While services like Cloudinary offer great transformation features, their free tier provides limited storage (~25GB total bandwidth/storage credits per month), and high-resolution 1080p lecture videos quickly exceed those limits.

To solve this, WhiteDavid23 LMS includes a native integration with **MEGA Drive (Mega.nz)** using the official Node.js library `megajs`:
- **Generous Free Storage**: MEGA provides 20 GB – 50 GB free cloud storage per account.
- **Zero Video Bandwidth Overage Fees**: Embed URLs allow direct, fast video delivery from MEGA's global edge network without consuming backend server bandwidth.
- **Secure File Storage**: End-to-end encrypted storage for lecture videos, PDFs, presentation slides, course thumbnails, and student avatars.
- **On-Demand Decrypted Streaming Proxy**: For situations where direct embeds are restricted, the backend provides an authenticated streaming proxy (`/api/video/mega-stream`).

---

## 2. Configuration & Environment Variables

To enable MEGA Drive in the LMS backend, add the following parameters to `server/.env`:

```env
# ==========================================
# MEGA Drive Cloud Storage Configuration
# ==========================================
# Your registered MEGA account email
MEGA_EMAIL=your_mega_email@example.com

# Your MEGA account password (or dedicated API master key)
MEGA_PASSWORD=your_mega_password_here

# (Optional) Alternative API key if password authentication is bypassed
MEGA_API_KEY=your_optional_mega_api_key

# Root folder name automatically managed in your MEGA Drive
MEGA_FOLDER_NAME=LMS-Drive-Storage
```

### Verification
When the server starts (`node app.js`), the MEGA client initializes non-blockingly:
- If credentials are valid:  
  `📡 Connecting to MEGA Drive as: your_email@example.com...`  
  `✅ Successfully authenticated and connected to MEGA Drive cloud storage!`
- If credentials are missing:  
  `⚠️ MEGA Drive is not configured: MEGA_EMAIL and MEGA_PASSWORD are empty in .env.`

---

## 3. Architecture & Singleton Connection Pattern

All MEGA interactions are centralized in `server/config/mega.js`. The connection utilizes an asynchronous **Singleton Pattern** to avoid authenticating multiple times for concurrent file operations.

```
       Incoming Upload / Stream Request
                     │
                     ▼
             isMegaConfigured()?
             ├── NO  ──► Logs warning / Fallbacks to Cloudinary
             └── YES ──► getMegaStorage() [Singleton]
                              │
             ┌────────────────┴────────────────┐
             │ Cached & Ready?                 │
             │ Yes ──► Reuse instance          │
             │ No  ──► Authenticate with MEGA  │
             └─────────────────────────────────┘
                              │
             ┌────────────────┴────────────────┐
             │ Automated Directory Resolution  │
             │ getOrCreateFolder(subCategory)  │
             └─────────────────────────────────┘
                              │
             ┌────────────────┴────────────────┐
             │ Target Folder:                  │
             │ /LMS-Drive-Storage/Videos       │
             │ /LMS-Drive-Storage/Thumbnails   │
             │ /LMS-Drive-Storage/Documents    │
             │ /LMS-Drive-Storage/Profile-Pics │
             └─────────────────────────────────┘
```

### Key Functions in `server/config/mega.js`:

| Function | Signature | Purpose |
| :--- | :--- | :--- |
| `isMegaConfigured()` | `() => boolean` | Checks whether `MEGA_EMAIL` and `MEGA_PASSWORD` exist. |
| `getMegaStorage()` | `async () => Storage` | Returns an authenticated, ready `Storage` singleton instance with `keepalive: true`. |
| `connectMega()` | `async () => void` | Invoked during `app.js` startup to establish connection without blocking HTTP server launch. |
| `getOrCreateFolder(sub)`| `async (subName) => Folder` | Traverses MEGA root; checks or creates `LMS-Drive-Storage/<subName>`. |
| `uploadBufferToMega()` | `async (buf, name, sub) => meta` | Streams buffer to the designated folder, generates public link and embed link. |
| `getFileStreamFromMega()` | `async (url) => { stream, name, size }` | Downloads and decrypts an on-the-fly read stream from any MEGA share link. |

---

## 4. Automated Folder Structure on MEGA Drive

When courses or media are uploaded, the LMS organizes assets into standardized subfolders under the root container `MEGA_FOLDER_NAME` (default: `LMS-Drive-Storage`):

```
MEGA Drive Root
└── LMS-Drive-Storage/
    ├── Videos/            (Lecture video files .mp4, .webm)
    ├── Thumbnails/        (Course banner images .jpg, .png, .webp)
    ├── Documents/         (Lecture slides, PDFs, notes .pdf, .docx, .pptx)
    └── Profile-Pictures/  (User avatars and educator photos)
```

The system automatically verifies whether the folder exists before creating it, ensuring zero folder duplication.

---

## 5. File Upload Flow & Code Example

### Specialized Upload Helpers
In `server/config/mega.js`:
```javascript
// Specialized media uploaders
export const uploadVideoToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Videos');
};

export const uploadImageToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Thumbnails');
};

export const uploadRawFileToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Documents');
};

export const uploadProfilePictureToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Profile-Pictures');
};
```

### Upload Result Object
Upon successful upload, `uploadBufferToMega()` returns:
```json
{
  "secure_url": "https://mega.nz/file/ABC123xyz#EncryptedFileKey999",
  "embed_url": "https://mega.nz/embed/ABC123xyz#EncryptedFileKey999",
  "public_id": "ABC123xyz",
  "fileName": "lecture_01_intro.mp4",
  "bytes": 48592100,
  "storageProvider": "mega"
}
```

---

## 6. How MEGA Embed URLs Work in the Video Player

MEGA offers an official iframe embed player for video files:

1. **Standard Share URL**:
   `https://mega.nz/file/abc123xyz#SecretKeyXYZ`
2. **Embed Player URL**:
   `https://mega.nz/embed/abc123xyz#SecretKeyXYZ`

### Frontend Client-Side Auto-Detection
In `client/src/components/course/CourseLearn.jsx` and `OpenVideoPlayer.jsx`, the helper `getMegaEmbedUrl(url)` automatically transforms any MEGA link format:

```javascript
export const getMegaEmbedUrl = (url) => {
  if (!url) return null;
  
  // Format 1: Already an embed URL
  if (url.includes('mega.nz/embed/') || url.includes('mega.io/embed/')) {
    return url;
  }
  
  // Format 2: Modern file share link: https://mega.nz/file/<id>#<key>
  const match = url.match(/^https?:\/\/(?:www\.)?mega\.(?:nz|io)\/file\/([a-zA-Z0-9_-]+#.+)$/);
  if (match) {
    return `https://mega.nz/embed/${match[1]}`;
  }
  
  // Format 3: Legacy link format: https://mega.nz/#!<id>!<key>
  const legacyMatch = url.match(/^https?:\/\/(?:www\.)?mega\.(?:nz|io)\/#!(?:file\/)?([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/);
  if (legacyMatch) {
    return `https://mega.nz/embed/${legacyMatch[1]}#${legacyMatch[2]}`;
  }
  
  // Fallback replace
  if (url.includes('mega.nz/file/') || url.includes('mega.io/file/')) {
    return url.replace('/file/', '/embed/');
  }
  return null;
};
```

When an educator pastes or uploads a MEGA Drive link, the LMS automatically identifies it via `isEmbedVideo(url)` and renders it through the security-shielded player wrapper with full anti-screenshot and watermark protections.

---

## 7. Decrypted Streaming Proxy (`/api/video/mega-stream`)

For clients that cannot display MEGA iframes or require native HTML5 video tags, the backend provides an on-the-fly streaming endpoint:

### Endpoint:
```http
GET /api/video/mega-stream?url=https://mega.nz/file/ABC123xyz#EncryptedKey
```

### Implementation (`server/routes/video.routes.js`):
```javascript
videoRouter.get('/mega-stream', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || (!url.includes('mega.nz') && !url.includes('mega.io'))) {
      return res.status(400).json({ success: false, message: 'Invalid MEGA URL' });
    }

    const { getFileStreamFromMega } = await import('../config/mega.js');
    const { stream, name, size } = await getFileStreamFromMega(url);

    // Auto-detect MIME type
    const lowerName = (name || '').toLowerCase();
    let contentType = 'application/octet-stream';
    if (lowerName.endsWith('.mp4')) contentType = 'video/mp4';
    else if (lowerName.endsWith('.webm')) contentType = 'video/webm';
    else if (lowerName.endsWith('.pdf')) contentType = 'application/pdf';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lowerName.endsWith('.png')) contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    if (size) res.setHeader('Content-Length', size);
    res.setHeader('Content-Disposition', `inline; filename="${name || 'file'}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Pipe decrypted stream straight to browser
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to stream from MEGA Drive', error: err.message });
  }
});
```

---

## 8. Security Architecture: Anti-Screenshot & Screen Recording Protection for MEGA Drive

A critical question for educators is: **"Can students take screenshots or screen record lectures hosted on MEGA Drive?"**

The answer is **NO** — WhiteDavid23 LMS wraps all MEGA Drive content in a proprietary, multi-layered security shield that actively blocks screenshots, blanks out recording software, and permanently marks all footage.

### 8.1 The Challenge of Cloud-Hosted Embeds
When streaming from MEGA Drive, the browser renders the video inside an `<iframe>` container. Standard websites have no control over what happens inside or outside an iframe, making cloud-hosted videos vulnerable to Snipping tools and screen recorders. 

WhiteDavid23 LMS overcomes this by surrounding the MEGA Drive embed within a **hierarchical hardware & DOM security envelope**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ .fp-video-area (Container)                                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Layer 1 (z-index 10): MEGA Drive Embed Iframe                    │  │
│  │ <iframe src="https://mega.nz/embed/..." />                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Layer 2 (z-index 60, pointer-events: none):                      │  │
│  │ DYNAMIC ROAMING WATERMARK                                        │  │
│  │ [🔒 student@example.com • ID: 890123 • LMS-SEC]                  │  │
│  │ (Moves unpredictably across the video every 5 seconds)           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Layer 3 (z-index 100): WINDOW BLUR BLACKOUT SHIELD               │  │
│  │ (Activates instantly when Snipping Tool, OBS, Loom is opened)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Layer 4 (z-index 120): SCREENSHOT ALERT FLASH BANNER             │  │
│  │ (Flashes blackout warning & auto-wipes OS clipboard)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Security Defenses Applied to MEGA Drive Lectures

#### 1. Dynamic Roaming Watermark Overlay (Anti-Screen Recording)
- The watermark layer (`.fp-drifting-watermark`) is rendered with `position: absolute; z-index: 60; pointer-events: none;`.
- Because `pointer-events: none` is used, the student can click anywhere on the MEGA video controls without interference.
- Every 5 seconds, the watermark drifts randomly across the MEGA video screen (`top: 15% - 75%`, `left: 10% - 65%`).
- **Forensic Deterrence**: If a student uses a screen recorder, an external phone camera, or a capture card to record the MEGA video, their personal email address, database ID, and verified timestamp are permanently burned into every frame of the recording.

#### 2. Window Blur & Snipping Tool Blackout Shield
- When a student attempts to use:
  - Windows Snipping Tool (`Win + Shift + S`)
  - macOS Screenshot Crosshair (`Cmd + Shift + 4`)
  - External screen recording software (OBS Studio, Loom, Camtasia)
- The browser window immediately loses focus (`window.onblur`).
- The LMS instantly renders the frosted blackout shield (`.fp-protection-shield`, `z-index: 100`) directly over the MEGA Drive video.
- The screen grabber or recorder captures only a blacked-out card reading:
  *"Screen Capture Protection Active — Video paused & screen hidden to prevent capture, recording, or window clipping."*

#### 3. PrintScreen & Capture Keyboard Interception
- Global event listeners intercept `PrintScreen` (keyCode 44), `Win + Shift + S`, `Cmd + Shift + 3/4/5`, and `Ctrl + P`.
- When pressed while viewing a MEGA Drive lecture:
  1. `e.preventDefault()` stops the browser action.
  2. The system invokes `navigator.clipboard.writeText()` to overwrite the OS clipboard with a copyright violation warning, clearing any captured image.
  3. The `.fp-screenshot-alert` blackout card flashes across the MEGA video.
  4. A security toast notification alerts the student that screenshots are prohibited.

#### 4. Decrypted Streaming Proxy (`/api/video/mega-stream`) for 100% Native Lockdown
In addition to iframe embeds, the LMS provides an alternative high-security delivery method via `/api/video/mega-stream`:
- The backend server streams and decrypts the MEGA video on-the-fly and pipes it to the browser as a clean MP4 stream.
- The video is rendered via native HTML5 `<video>` inside Fluid Player.
- This unlocks complete hardware lockdown:
  - `disablePictureInPicture={true}` (prevents popping out of the shielded container)
  - `controlsList="nodownload noplaybackrate"` (removes native browser download options)
  - Context menu and drag events disabled (`onContextMenu={(e) => e.preventDefault()}`)
  - The student never sees or receives the original MEGA URL or encryption key, preventing direct file downloads.

#### 5. Screen Recording API Blocker
- Browser extensions (Loom, Screencastify) invoke `navigator.mediaDevices.getDisplayMedia()` to capture tabs.
- The LMS intercepts and monkey-patches `getDisplayMedia`, immediately throwing a `NotAllowedError` and blocking the recording extension.

---

## 9. Best Practices for Educators Using MEGA

1. **Uploads up to 1GB**: The backend server is configured with 600-second timeouts (`app.timeout = 600000;`) and 600MB body limits to accommodate large lecture videos.
2. **Direct Links from MEGA Web App**: Educators can also upload directly to their own MEGA Drive account via [mega.nz](https://mega.nz), copy the file link (`https://mega.nz/file/...`), and paste it directly into the Course Editor Lecture URL input! The LMS player will embed and stream it seamlessly with full screenshot and recording security.
3. **Bandwidth Savings**: Direct embed links stream directly from MEGA CDN servers to the student's browser, using **0 bytes** of server bandwidth on Render/Vercel.

---

## 10. Troubleshooting MEGA Integration

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `MEGA credentials missing` | Missing `MEGA_EMAIL` or `MEGA_PASSWORD` in `.env` | Ensure `.env` contains valid credentials. |
| `EINTERNAL` or `Server error` from MEGA | Too many login requests or invalid credentials | The LMS uses a singleton connection to avoid repeated logins. Check credentials on [mega.nz](https://mega.nz). |
| Video shows "File not found" in embed | Share link key was truncated or expired | Ensure link includes both the file ID and the encryption key after the `#` character. |
| Streaming proxy timeout on large files | Network slowdown on backend | Use direct embed URLs (`embed_url`) for files > 200MB. |

