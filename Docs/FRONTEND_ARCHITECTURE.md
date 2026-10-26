# Frontend Architecture & Component Directory

This document details the frontend architecture, component hierarchy, state management, routing, and UI design patterns implemented in the **WhiteDavid23 LMS** client application.

---

## 1. Frontend Technology Stack & Foundation

- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 7 (`@vitejs/plugin-react`)
- **Router**: React Router v7 (`react-router-dom`)
- **CSS Architecture**: Tailwind CSS v4 + Curated Vanilla CSS Design Tokens
- **Icons**: Lucide React (`lucide-react`) & React Icons (`react-icons`)
- **Animations**: Framer Motion (`framer-motion`)
- **HTTP Client**: Axios (`axios`) with unified request/response interceptors

---

## 2. Global State Management: AuthContext

State management is centralized in `client/src/context/AuthContext.jsx`:

### State Variables:
- `user`: Holds the currently authenticated user object (`_id`, `name`, `email`, `role`, `profileImage`, `enrolledCourses`).
- `isLoggedIn`: Boolean flag indicating active session.
- `loading`: Boolean indicating initial session verification state.

### Provided Functions:
- `login(credentials)`: Authenticates against `/api/auth/login`, stores JWT in `localStorage`, and updates user state.
- `register(userData)`: Dispatches to `/api/auth/verify-otp` to finalize registration.
- `logout()`: Clears `localStorage`, calls `/api/auth/logout` to clear cookies, and resets state.
- `checkAuthStatus()`: Invoked on app mount to verify existing tokens against `/api/user/profile`.

---

## 3. Routing Architecture & Protected Layouts

Routing is declared in `client/src/App.jsx` using React Router:

```
App Router
├── Public Routes (StudentLayout)
│   ├── /                          ──► Home (Hero, Featured Courses, Testimonials)
│   ├── /courses                   ──► All Courses Catalog
│   ├── /courses/:category         ──► Filtered Category Catalog
│   ├── /search                    ──► Keyword Course Search
│   ├── /course/:id                ──► Course Details / Syllabus / Enroll
│   ├── /about                     ──► About LMS Platform
│   ├── /login                     ──► Student & Educator Login
│   ├── /signup                    ──► Registration with OTP Verification
│   ├── /forgot-password           ──► Password Reset Workflow
│   └── /reset-password            ──► Reset Password OTP & Confirmation
│
├── Protected Student Routes (StudentLayout)
│   ├── /my-enrollments            ──► Enrolled Courses Dashboard
│   ├── /student/dashboard         ──► Student Dashboard & Progress Overview
│   └── /my-account                ──► Profile, Avatar, Password & Settings
│
├── Protected Classroom Route (Standalone Fullscreen Layout)
│   └── /course/:id/learn          ──► CourseLearn (Interactive Learning Room)
│
└── Protected Educator Routes (EducatorLayout - Role: 'educator')
    ├── /educator                  ──► Educator Dashboard (KPIs & Quick Actions)
    ├── /educator/courses          ──► Course Management Table & Publish Toggles
    ├── /educator/add-course       ──► Multi-Step Course Creator Wizard
    ├── /educator/edit-course/:id  ──► Course, Chapter & Lecture Editor
    ├── /educator/analytics        ──► Revenue & Student Engagement Metrics
    └── /educator/students         ──► Student Roster & Course Enrollment Manager
```

---

## 4. Key Component Deep Dive

### 4.1 The Interactive Learning Room (`CourseLearn.jsx`)
Located at `client/src/components/course/CourseLearn.jsx`, this is the core learning interface:
- **Left Curriculum Sidebar**: Collapsible drawer with accordion-based chapters, lecture checkmarks, duration badges, and progress percentages.
- **Smart Media Switcher**:
  - If lecture is video: Mounts `OpenVideoPlayer.jsx`.
  - If lecture is document/PDF: Mounts `ProtectedPdfViewer.jsx`.
- **Lecture Control Bar**: Next/Previous quick navigation buttons and "Mark as Complete" action button.
- **Tabbed Panels**:
  - **Overview**: Course objectives, description, instructor bio.
  - **Curriculum**: Full course syllabus with quick lecture selection.
  - **Notes**: Embedded student notebook with auto-save to `localStorage`.
  - **Resources**: Slide decks and download-restricted lecture attachments.
  - **Discussion**: Q&A discussion forum between students and instructor.

---

### 4.2 The Custom Video Player (`OpenVideoPlayer.jsx`)
Located at `client/src/components/course/OpenVideoPlayer.jsx`:
- **Fluid Player Integration**: Uses Fluid Player for custom themes, playback speed selection (0.5x to 2x), and theatre layout.
- **Enhanced View Toolbar**:
  - **Zoom Controls**: Zoom Out / Reset / Zoom In from 50% to 300%.
  - **Screen Rotation**: 90° clockwise rotation button for mobile/tablet horizontal reading.
  - **Fullscreen Toggle**: Native container fullscreen support.
- **Multi-Layer DRM Security**:
  - Dynamic roaming watermark (`student@example.com`).
  - Window blur blackout shield.
  - Screenshot key interceptor (`PrintScreen`, `Win+Shift+S`, etc.).
  - `disablePictureInPicture` and `controlsList="nodownload noplaybackrate"`.

---

### 4.3 The Protected PDF Canvas Viewer (`ProtectedPdfViewer.jsx`)
Located at `client/src/components/course/ProtectedPdfViewer.jsx`:
- **Mozilla PDF.js Rendering**: Converts PDF pages into canvas pixels without revealing document source files.
- **Top Control Bar**:
  - Page navigation (`Prev`, `Next`, `Current / Total`).
  - Direct Jump to Page input and quick jump modal (`j`).
  - Zoom In / Zoom Out / Reset scale buttons.
  - Fullscreen toggle.
- **Security Protections**:
  - Right-click context menu disabled.
  - Keyboard shortcuts (`Ctrl + S`, `Ctrl + P`, `PrintScreen`) blocked.
  - Dynamic roaming watermark over the canvas.

---

### 4.4 The Educator Course Creator (`EducatorAddCourse.jsx`)
Located at `client/src/components/Educator/EducatorAddCourse.jsx`:
- Multi-step interactive course creation wizard:
  1. **Course Details**: Title, subtitle, description, category, level, base price, discount percentage.
  2. **Media & Thumbnail**: Upload course banner to MEGA Drive or Cloudinary with live preview.
  3. **Curriculum Builder**: Dynamic addition of chapters, video lectures, document attachments, and free-preview toggles.
  4. **Publish Setting**: Save as draft or publish directly to the live catalog.

---

## 5. API Client Architecture (`client/src/Api/`)

All HTTP communications are organized into dedicated API modules in `client/src/Api/`:
- `config.js`: Creates the Axios instance with `baseURL: import.meta.env.VITE_BACKEND_URL`, `withCredentials: true`, and injects `Authorization: Bearer <token>` from `localStorage`.
- `authApi.js`: Authentication, OTP, login, and password reset endpoints.
- `courseApi.js`: Course listing, filtering, search, and educator CRUD.
- `chapterApi.js`: Chapter creation and deletion.
- `lectureApi.js`: Lecture uploads, ordering, and document proxy links.
- `userApi.js`: Enrolled courses, course progress updates, reviews, and profile settings.
- `videoApi.js`: Multipart media uploads.

---

## 6. Styling Guidelines & Responsive Design

- **Curated Dark Theme**: Sleek slate color palette (`bg-slate-950`, `bg-slate-900`, `border-slate-800`).
- **Glassmorphism**: Backdrop blur overlays (`backdrop-blur-md`, `bg-slate-900/80`).
- **Mobile First Navigation**: Mobile curriculum drawer, thumb-accessible 3-button playback controls on phones, responsive data tables for tablets and desktops.
- **Print Protection**: Enforced across all CSS files (`@media print { body { display: none !important; } }`).
