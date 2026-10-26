# DRM & Content Protection Architecture

This document provides an in-depth breakdown of the proprietary multi-layer **Content Protection & Anti-Screen Capture System** implemented across the WhiteDavid23 LMS platform.

---

## 1. Overview of the Security Challenge

In browser-based e-learning platforms, course piracy usually occurs through three main attack vectors:
1. **OS-Level Screen Snipping**: Tools like Windows Snipping Tool (`Win + Shift + S`), macOS Screenshot (`Cmd + Shift + 4`), and Linux GNOME Screenshot.
2. **Screen Recording Utilities**: Software such as OBS Studio, Loom, Camtasia, QuickTime, Bandicam, or browser extensions using `getDisplayMedia`.
3. **Source Code / Network Inspection**: Using browser Developer Tools (`F12`), `Ctrl + S` (Save Page As), or right-click context menu "Save Video As...".

Because browsers run in user-space without kernel DRM (such as Widevine L1 on Android/SmartTVs), standard web apps cannot physically disable the OS hardware PrintScreen button. However, WhiteDavid23 LMS deploys a **6-Layer Defense System** that renders screen captures and recordings blacked-out, cleared, or indelibly traced to the offending user.

---

## 2. The 6-Layer Defense Architecture

```
                    Incoming Screen Capture / Recording Attempt
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ Layer 1: Blur Shield ]     [ Layer 2: Key Intercept ]     [ Layer 3: Roaming Watermark ]
 Window Blur / Snipping Tool   PrintScreen / Win+Shift+S     Dynamic user email + ID drifting
 Blackout Shield Activated     Clipboard Auto-Wiped          Burns identity into every frame
        │                              │                              │
        ├──────────────────────────────┼──────────────────────────────┤
        ▼                              ▼                              ▼
 [ Layer 4: Screen Rec Block ] [ Layer 5: HTML5 Lockdown ]   [ Layer 6: Print Shield ]
 Intercepts getDisplayMedia    disablePictureInPicture       @media print blackout
 Throws NotAllowedError        controlsList="nodownload"     user-select: none
```

---

## 3. Detailed Defense Layer Breakdown

### Layer 1: Window Blur & Focus Loss Blackout Shield
**Target Attack**: Windows Snipping Tool (`Win + Shift + S`), macOS Screenshot Crosshair, OBS / Loom window focus.

- **Mechanism**: Whenever an external capture tool is triggered, or the user switches windows to a screen recording app, the browser tab immediately fires `window.onblur` or `document.visibilityState === 'hidden'`.
- **Action**:
  1. The video or document instantly pauses: `playerInstance.pause()`.
  2. The player area is instantly covered by a frosted blackout shield (`.fp-protection-shield` / `.pdf-protection-shield`).
  3. The capture tool only captures a pitch-black screen stating:
     *"Screen Capture Protection Active — Video paused & screen hidden to prevent capture, recording, or window clipping."*
  4. Smart iframe detection (`document.activeElement.tagName === 'IFRAME'`) prevents false-positive blackouts when interacting with embedded video controls.
  5. Returning focus to the window or clicking anywhere on the shield immediately resumes playback.

---

### Layer 2: Keyboard Shortcut Interception & Clipboard Wiper
**Target Attack**: `PrintScreen` key, browser print (`Ctrl + P`), web inspection (`F12`), page save (`Ctrl + S`).

- **Mechanism**: Global keydown and keyup listeners attached to `window` with capture-phase prioritization (`useCapture: true`).
- **Intercepted Shortcuts**:
  - `PrintScreen` / keyCode `44`
  - `Win + Shift + S` / `Cmd + Shift + 3/4/5` / `Ctrl + Shift + S`
  - `Ctrl + P` / `Cmd + P` (Print to PDF)
  - `Ctrl + S` / `Cmd + S` (Save Page As)
  - `F12`, `Ctrl + Shift + I/J/C` (Developer Tools)
  - `Ctrl + U` (View Page Source)
- **Action**:
  1. Calls `e.preventDefault()` and `e.stopPropagation()`.
  2. **Overwrites the OS Clipboard** immediately using `navigator.clipboard.writeText`:
     ```text
     ⚠️ Protected Content: Screenshots and screen recordings are strictly prohibited on WhiteDavid23 LMS.
     ```
     If the operating system managed to grab the screen buffer, the clipboard is immediately overwritten with the warning text instead of the image.
  3. Displays a high-visibility security alert banner (`.fp-screenshot-alert`) over the player for 3.5 seconds.
  4. Shows a toast warning alert via `react-hot-toast`.

---

### Layer 3: Dynamic Roaming Watermark Engine
**Target Attack**: External hardware HDMI capture cards, phone cameras pointed at the screen, and background screen recorders.

- **Mechanism**: A floating semi-transparent pill (`.fp-drifting-watermark` / `.pdf-drifting-watermark`) rendered directly inside the video viewport.
- **Dynamic Relocation**: Every 5 seconds, an automated timer calculates random coordinates:
  - `top`: Randomly between `15%` and `75%`.
  - `left`: Randomly between `10%` and `65%`.
  - `opacity`: Subtle semi-transparency (`0.28` to `0.44`).
- **Data Displayed**:
  ```text
  🔒 student@example.com • ID: 890123 • LMS-SEC
  ```
- **Why this kills piracy**: A static watermark in the corner can easily be cropped or covered with a black bar by pirates. A roaming watermark that moves unpredictably over the lecture material makes leaked videos completely un-croppable and permanently ties the piracy to the student's registered account.

---

### Layer 4: Screen Recording API Blocker
**Target Attack**: Browser extensions (Loom, Screencastify, Vidyard) and web-based screen recording apps.

- **Mechanism**: When an extension or web tool attempts to initiate screen recording through the browser, it calls the Web API `navigator.mediaDevices.getDisplayMedia()`.
- **Action**: WhiteDavid23 LMS hooks and wraps this API:
  ```javascript
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = async function(...args) {
      toast.error('Screen recording is disabled for lecture content protection.');
      throw new DOMException('Screen recording blocked by WhiteDavid23 LMS Security Policy', 'NotAllowedError');
    };
  }
  ```
  Any browser extension or tab-sharing attempt is rejected with a `NotAllowedError`.

---

### Layer 5: HTML5 Media Tag Lockdown
- **`disablePictureInPicture`**: Prevents the video from popping out into an unshielded Picture-in-Picture floating window.
- **`controlsList="nodownload noplaybackrate"`**: Removes native browser download buttons.
- **`onContextMenu={(e) => e.preventDefault()}`**: Blocks the browser right-click menu ("Save video as...", "Copy video URL").
- **`onDragStart={(e) => e.preventDefault()}`**: Prevents dragging video or canvas frames to external windows or desktop.

---

### Layer 6: Print Shield & Text Selection Restrictions
- **CSS `@media print` Shield**:
  ```css
  @media print {
    body {
      display: none !important;
    }
    .fp-outer-wrapper,
    .protected-pdf-container,
    .course-learn-container {
      display: none !important;
      visibility: hidden !important;
    }
  }
  ```
  Attempting to print or save the web page as a PDF produces a 100% blank page.
- **Text Selection Restrictions**:
  The entire course player interface enforces `user-select: none !important; -webkit-user-select: none !important;`, with specific exceptions carved out only for student notes in the textarea editor.

---

## 4. Protected PDF Document Architecture

For lecture slide decks and reading materials:
- Documents are streamed via `/api/lecture/document/:lectureId?token=...` which validates enrollment.
- Rendered exclusively using Mozilla **PDF.js** onto an HTML5 `<canvas>`.
- **Zero Download Exposure**: Unlike native browser PDF viewers that show the Acrobat toolbar with a "Download" button, the canvas renderer exposes no raw downloadable files in the DOM.
- Canvas has the same window-blur blackout shield and roaming watermark protection applied.

---

## 5. Protecting External & Cloud-Hosted Video Streams (MEGA Drive)

When courses use **MEGA Drive** for high-volume video hosting, videos can be delivered in two ways:
1. **Direct Embed Iframe** (`https://mega.nz/embed/...`)
2. **Decrypted On-the-Fly Streaming Proxy** (`/api/video/mega-stream?url=...`)

### How MEGA Drive Embeds are Protected against Screenshots & Screen Recording:
- **Hierarchical DOM Z-Indexing**:
  - The MEGA Drive `<iframe>` is placed inside `.fp-embed-wrapper` with `z-index: 10`.
  - The **Dynamic Roaming Watermark** sits on top with `position: absolute; z-index: 60; pointer-events: none;`. It moves across the MEGA player every 5 seconds, displaying the student's email and ID.
  - The **Window Blur Blackout Shield** sits on top with `position: absolute; z-index: 100;`. When a student launches Windows Snipping Tool (`Win + Shift + S`) or focuses OBS/Loom, the shield activates immediately and blacks out the entire MEGA player.
  - The **Screenshot Alert Banner** sits on top with `position: absolute; z-index: 120;`. When `PrintScreen` is pressed, the event is intercepted, the clipboard is auto-wiped, and the alert covers the MEGA video.
- **Decrypted Streaming Proxy (`/api/video/mega-stream`)**:
  - Piped into the native HTML5 `<video>` tag inside Fluid Player.
  - Enables `disablePictureInPicture`, `controlsList="nodownload noplaybackrate"`, right-click disabled, and hides the original MEGA link from the client.

