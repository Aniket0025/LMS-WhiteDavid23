# System Architecture & Technical Specifications

This document outlines the system architecture, design patterns, folder organization, request lifecycles, and technical specifications of the **WhiteDavid23 Advanced LMS**.

---

## 1. Architectural Style & Design Philosophy

WhiteDavid23 LMS follows a modern, decoupled **Client-Server RESTful Architecture**:
- **Frontend Client**: Single Page Application (SPA) built with **React 19**, **Vite**, and **Tailwind CSS**, communicating asynchronously with the backend via Axios HTTP requests.
- **Backend API Gateway**: Built with **Node.js** and **Express 5**, implementing layered controllers, middleware-based authentication, and Mongoose ODM models.
- **Storage Layer**: Dual-cloud decoupled media architecture combining **MEGA Drive** and **Cloudinary** for scalable media delivery.
- **Stateless Authentication**: Role-based access control (RBAC) powered by JSON Web Tokens (JWT) stored in HTTP-only cookies or Authorization headers.

---

## 2. Full Technology Stack

### Frontend Stack (`/client`)
- **Core Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 7 with Fast Refresh (`@vitejs/plugin-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Systems
- **Icons**: Lucide React (`lucide-react`) & React Icons (`react-icons`)
- **Animations**: Framer Motion (`framer-motion`)
- **Video Playback**: Fluid Player v3.60 (`fluid-player`)
- **Document Viewing**: Mozilla PDF.js (`pdfjs-dist`)
- **Notifications**: React Hot Toast (`react-hot-toast`)
- **Carousels**: React Slick (`react-slick`, `slick-carousel`)

### Backend Stack (`/server`)
- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express 5 (`express`)
- **Database Engine**: MongoDB Atlas with Mongoose ODM v8 (`mongoose`)
- **Authentication**: JWT (`jsonwebtoken`) & password hashing (`bcryptjs`)
- **Cloud Storage**: MEGA Drive SDK (`megajs`) & Cloudinary (`cloudinary`)
- **File Upload Parsing**: Multer (`multer`)
- **Email Delivery**: Nodemailer (`nodemailer`)
- **Compression**: Gzip/Deflate compression (`compression`)
- **Logging**: Morgan HTTP request logger (`morgan`)
- **Security & Utilities**: CORS (`cors`), Cookie Parser (`cookie-parser`), Adm-Zip (`adm-zip`)

---

## 3. Directory Layouts

### 3.1 Backend Directory Tree (`/server`)

```
server/
├── config/                  # External service configs
│   ├── cloudnary.js         # Cloudinary SDK init
│   ├── mega.js              # MEGA Drive singleton client & upload helpers
│   ├── mongodb.js           # Mongoose MongoDB connection
│   ├── multer.js            # Memory upload & Cloudinary streaming storage
│   └── nodemailer.js        # SMTP email transporter
├── controllers/             # Business logic handlers
│   ├── auth.controllers.js   # Login, registration, OTP, password reset
│   ├── chapter.controllers.js# Chapter CRUD
│   ├── course.controllers.js # Course creation, listing, search, analytics
│   ├── lecture.controllers.js# Lecture CRUD, access checking, doc proxy
│   └── user.controllers.js   # User profiles, enrollments, progress, stats
├── middleware/              # Express middlewares
│   └── authMiddleaare.js    # JWT verification & RBAC authorization
├── model/                   # Mongoose database schemas
│   ├── chapter.model.js     # Chapter schema
│   ├── course.model.js      # Course schema
│   ├── courseProgress.model.js # Progress tracking schema
│   ├── lecture.model.js     # Lecture schema
│   ├── purchase.model.js    # Purchase transaction schema
│   └── user.model.js        # User account schema
├── routes/                  # Express route definitions
│   ├── auth.routes.js       # /api/auth routes
│   ├── chapter.routes.js    # /api/chapter routes
│   ├── course.routes.js     # /api/course routes
│   ├── lecture.routes.js    # /api/lecture routes
│   ├── user.routes.js       # /api/user routes
│   └── video.routes.js      # /api/video & /mega-stream routes
├── utils/                   # Shared utility modules
│   ├── emailUtils.js        # HTML email templates
│   └── recaptchaUtils.js    # Google reCAPTCHA verification
├── app.js                   # Express application entry point & pipeline
├── package.json             # Backend dependencies & scripts
├── render.yaml              # Render deployment configuration
└── vercel.json              # Serverless configuration (if deployed on Vercel)
```

### 3.2 Frontend Directory Tree (`/client`)

```
client/
├── src/
│   ├── Api/                 # Axios API service instances
│   │   ├── authApi.js       # Authentication requests
│   │   ├── chapterApi.js    # Chapter management requests
│   │   ├── config.js        # Axios base URL & interceptors
│   │   ├── courseApi.js     # Course catalog & CRUD requests
│   │   ├── lectureApi.js    # Lecture & document access requests
│   │   ├── userApi.js       # Progress, ratings, profile requests
│   │   └── videoApi.js      # Media upload requests
│   ├── components/          # Reusable UI components
│   │   ├── Educator/        # Educator Portal
│   │   │   ├── EducatorAddCourse.jsx
│   │   │   ├── EducatorAllCourse.jsx
│   │   │   ├── EducatorAnalytics.jsx
│   │   │   ├── EducatorDashboard.jsx
│   │   │   ├── EducatorEditAndDeleteCourse.jsx
│   │   │   └── EducatorStudents.jsx
│   │   ├── Student/         # Student Portal & Public Pages
│   │   │   ├── About.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ForgotPasswordOTP.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StudentAccount.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── course/          # Course Player & Document Viewer
│   │   │   ├── AllCourse.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── CourseLearn.jsx          # Interactive learning room
│   │   │   ├── OpenVideoPlayer.jsx      # Fluid Player + Anti-screenshot
│   │   │   └── ProtectedPdfViewer.jsx   # PDF.js Canvas + Anti-screenshot
│   │   └── layouts/         # Layout wrappers
│   │       ├── EducatorLayout.jsx
│   │       └── StudentLayout.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state & session provider
│   ├── pages/
│   │   ├── Home.jsx         # Landing page
│   │   └── NotFound.jsx     # 404 error page
│   ├── App.jsx              # React router configuration
│   ├── index.css            # Global Tailwind CSS definitions
│   └── main.jsx             # React DOM root mounting
├── index.html               # HTML entry point
├── package.json             # Frontend dependencies
└── vite.config.js           # Vite bundler configuration
```

---

## 4. Backend Request Pipeline & Middleware Chain

When an HTTP request reaches `server/app.js`, it passes through the following sequential pipeline:

```
[ Incoming HTTP Request ]
         │
         ▼
 1. compression()                    # Gzip compression for all outgoing payloads
         │
         ▼
 2. Reverse Proxy Trust (1)          # Extracts true client IP behind Render/Vercel proxies
         │
         ▼
 3. morgan('dev')                    # HTTP access logger
         │
         ▼
 4. cors({ origin: isOriginAllowed })# Validates Vercel, localhost & custom domains
         │
         ▼
 5. cookieParser()                   # Extracts authentication tokens from cookies
         │
         ▼
 6. Multipart Form-Data Bypass       # If upload endpoint, bypasses JSON body parser
    ├── Yes: Sets 5-min timeout      # and reserves stream for Multer
    └── No:  express.json(600mb)
         │
         ▼
 7. Database Readiness Guard         # If MongoDB connection is lost (0), fast-fails
    (/api/* routes)                  # with 503 instead of buffering/hanging
         │
         ▼
 8. Express Routers (/api/*)         # Dispatches to auth, course, lecture, user routers
         │
         ▼
 9. Controller Execution             # Executes Mongoose operations & cloud services
         │
         ▼
10. Global Error Handler             # Intercepts uncaught exceptions and guarantees
                                     # JSON response format with CORS headers
```

---

## 5. Security & Authentication Model

### 5.1 Token-Based Authentication
- Tokens are signed with HMAC SHA-256 via `jsonwebtoken` using the secret `JWT_TOKEN`.
- Payload contains `{ id: user._id, role: user.role }`.
- Tokens are delivered via:
  1. `Set-Cookie` with `httpOnly: true`, `secure: true`, `sameSite: 'none'` (for cross-origin requests).
  2. JSON response payload stored in `localStorage` under key `'token'`, sent as `Authorization: Bearer <token>`.

### 5.2 Role-Based Access Control (RBAC)
Middleware `authorize('educator')` or `authorize('student', 'educator')` validates that the authenticated user possesses the required privilege before granting access:
- **Educator**: Can create, update, delete courses, chapters, and lectures; view analytics; manage student enrollments.
- **Student**: Can browse published courses, enroll, track progress, take lecture notes, submit reviews, and change profile.
