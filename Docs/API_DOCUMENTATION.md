# REST API Reference & Endpoint Specifications

This document provides complete documentation for all REST API endpoints available in the WhiteDavid23 Advanced LMS platform, including request payloads, query parameters, authorization headers, and response formats.

---

## 1. General API Conventions

### Base URL
- **Local Development**: `http://localhost:5000/api`
- **Production (Render)**: `https://your-api.onrender.com/api`

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Standard Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Error Response Structure
```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "Error details (in development mode only)"
}
```

---

## 2. Authentication API (`/api/auth`)

### 2.1 Send Registration OTP
Generates and emails a 6-digit verification code to a prospective user.
- **Method**: `POST`
- **Endpoint**: `/api/auth/send-registration-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "SecurePassword123!",
    "role": "student"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to your email"
  }
  ```

### 2.2 Verify OTP & Complete Registration
Validates the 6-digit OTP code and creates the database user account.
- **Method**: `POST`
- **Endpoint**: `/api/auth/verify-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "otp": "492810"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account verified and registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "67b9a1029c31405e3a890123",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "role": "student"
    }
  }
  ```

### 2.3 Resend Registration OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/resend-otp`
- **Request Body**: `{ "email": "johndoe@example.com" }`

### 2.4 User Login
Authenticates an existing user and returns a JWT token.
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "_id": "67b9a1029c31405e3a890123",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "role": "student"
    }
  }
  ```

### 2.5 User Logout
Clears HTTP-only session cookies.
- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Access**: Public

### 2.6 Forgot Password Flow
- **`POST /api/auth/forgot-password`**: `{ "email": "johndoe@example.com" }` — Sends reset OTP to email.
- **`POST /api/auth/verify-reset-otp`**: `{ "email": "...", "otp": "..." }` — Validates reset OTP.
- **`POST /api/auth/reset-password`**: `{ "email": "...", "otp": "...", "newPassword": "..." }` — Updates user password.

---

## 3. Course Management API (`/api/course`)

### 3.1 Get All Published Courses
Lists published courses for the public catalog and student dashboard.
- **Method**: `GET`
- **Endpoint**: `/api/course/all`
- **Access**: Public
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "courses": [
      {
        "_id": "67b9c99142e01a45b6789def",
        "title": "Complete Full Stack Web Development",
        "subTitle": "From Beginner to Advanced with Node.js & React",
        "price": 2999,
        "discount": 20,
        "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
        "educator": {
          "_id": "67b9a001...",
          "name": "Professor David"
        },
        "courseRatings": [5, 4, 5],
        "isPublished": true
      }
    ]
  }
  ```

### 3.2 Search Courses
- **Method**: `GET`
- **Endpoint**: `/api/course/search?query=react`
- **Access**: Public

### 3.3 Create Course (Educator)
Creates a new course draft.
- **Method**: `POST`
- **Endpoint**: `/api/course/create`
- **Access**: Protected (`educator` only)
- **Request Body**:
  ```json
  {
    "title": "Modern Cloud Architecture with Docker & Kubernetes",
    "subTitle": "Learn container orchestration hands-on",
    "description": "Comprehensive practical course on microservices...",
    "price": 4999,
    "discount": 15,
    "category": "Cloud Computing",
    "level": "Intermediate",
    "language": "English",
    "thumbnail": "https://mega.nz/embed/... or https://res.cloudinary.com/..."
  }
  ```

### 3.4 Get Course By ID (Course Details / Learning Room)
- **Method**: `GET`
- **Endpoint**: `/api/course/:courseId`
- **Access**: Public (Detailed content populated)

### 3.5 Update Course Details
- **Method**: `PATCH`
- **Endpoint**: `/api/course/:courseId/update`
- **Access**: Protected (`educator` only)
- **Content-Type**: `multipart/form-data` or `application/json`

### 3.6 Toggle Course Publish State
Publishes or unpublishes a course from the public catalog.
- **Method**: `PATCH`
- **Endpoint**: `/api/course/:courseId/toggle-publish`
- **Access**: Protected (`educator` only)

### 3.7 Delete Course
- **Method**: `DELETE`
- **Endpoint**: `/api/course/:courseId`
- **Access**: Protected (`educator` only)

### 3.8 Educator Analytics
Retrieves total earnings, total enrolled students, and course performance metrics.
- **Method**: `GET`
- **Endpoint**: `/api/course/analytics`
- **Access**: Protected (`educator` only)

---

## 4. Chapters & Lectures API

### 4.1 Create Chapter
- **Method**: `POST`
- **Endpoint**: `/api/chapter/:courseId`
- **Access**: Protected (`educator` only)
- **Request Body**: `{ "chapterTitle": "Chapter 1: Getting Started" }`

### 4.2 Delete Chapter
- **Method**: `DELETE`
- **Endpoint**: `/api/chapter/:chapterId`
- **Access**: Protected (`educator` only)

### 4.3 Create Lecture
- **Method**: `POST`
- **Endpoint**: `/api/lecture/:courseId/:chapterId`
- **Access**: Protected (`educator` only)
- **Request Body**:
  ```json
  {
    "title": "Introduction to Containerization",
    "videoUrl": "https://mega.nz/embed/...",
    "videoDuration": 720,
    "isPreviewFree": false,
    "documentUrl": "https://res.cloudinary.com/.../slides.pdf",
    "lectureType": "video"
  }
  ```

### 4.4 Get Lecture With Access Check
Verifies enrollment and returns secure playback tokens.
- **Method**: `GET`
- **Endpoint**: `/api/lecture/access/:lectureId`
- **Access**: Protected (Enrolled student or course author)

### 4.5 Document Proxy Streaming
Streams lecture PDF documents directly to the HTML5 canvas viewer without revealing raw storage URLs.
- **Method**: `GET`
- **Endpoint**: `/api/lecture/document/:lectureId?token=<jwt_token>`
- **Access**: Protected (Validates token via query parameter or header)

### 4.6 Reorder Lectures
- **Method**: `PUT`
- **Endpoint**: `/api/lecture/reorder/:chapterId`
- **Access**: Protected (`educator` only)
- **Request Body**: `{ "lectureIds": ["id1", "id2", "id3"] }`

---

## 5. User Progress & Student Portal API (`/api/user`)

### 5.1 Get User Profile
- **Method**: `GET`
- **Endpoint**: `/api/user/profile`
- **Access**: Protected (`student`, `educator`)

### 5.2 Update User Profile
- **Method**: `PUT`
- **Endpoint**: `/api/user/profile`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "headline": "Full Stack Developer",
    "bio": "Enthusiastic web learner",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  }
  ```

### 5.3 Upload User Avatar
- **Method**: `POST`
- **Endpoint**: `/api/user/profile/upload-avatar`
- **Access**: Protected
- **Content-Type**: `multipart/form-data` (`avatar` field)

### 5.4 Get Enrolled Courses with Live Progress
- **Method**: `GET`
- **Endpoint**: `/api/user/enrolled-courses`
- **Access**: Protected (`student`, `educator`)

### 5.5 Enroll / Purchase Course
Enrolls the student into a course.
- **Method**: `POST`
- **Endpoint**: `/api/user/purchase/:courseId`
- **Access**: Protected

### 5.6 Check Course Purchase Status
- **Method**: `GET`
- **Endpoint**: `/api/user/purchase-status/:courseId`
- **Access**: Protected
- **Response**: `{ "success": true, "isEnrolled": true }`

### 5.7 Update Course Progress (Mark Lecture Complete)
- **Method**: `PUT`
- **Endpoint**: `/api/user/progress/:courseId`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "lectureId": "67b9a543...",
    "chapterId": "67b9a512...",
    "chapter": 0,
    "lecture": 2
  }
  ```

### 5.8 Rate Course
- **Method**: `POST`
- **Endpoint**: `/api/user/rating/:courseId`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "rating": 5,
    "review": "Exceptional course! Very clear explanation."
  }
  ```

### 5.9 Educator Student Provisioning (Educator Admin)
- **`POST /api/user/educator/add-student`**: Enrolls a student directly by email.
- **`PUT /api/user/educator/student/:studentId`**: Updates student course assignments.
- **`DELETE /api/user/educator/student/:studentId`**: Removes student from course.

---

## 6. Media & Cloud Storage API (`/api/video`)

### 6.1 Upload Video File
- **Method**: `POST`
- **Endpoint**: `/api/video/upload`
- **Access**: Protected (`educator` only)
- **Content-Type**: `multipart/form-data` (`video` field, max 1GB)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Video uploaded successfully",
    "videoUrl": "https://res.cloudinary.com/.../video_123.mp4",
    "videoId": "video_123",
    "duration": 425.6,
    "format": "mp4",
    "size": 38402910
  }
  ```

### 6.2 Upload Course Thumbnail Image
- **Method**: `POST`
- **Endpoint**: `/api/video/upload-image`
- **Access**: Protected (`educator` only)
- **Content-Type**: `multipart/form-data` (`image` field, max 10MB)

### 6.3 Upload Document (PDF / Slide deck)
- **Method**: `POST`
- **Endpoint**: `/api/video/upload-document`
- **Access**: Protected (`educator` only)
- **Content-Type**: `multipart/form-data` (`document` field)

### 6.4 Stream Decrypted Media from MEGA Drive
- **Method**: `GET`
- **Endpoint**: `/api/video/mega-stream?url=https://mega.nz/file/ABC#KEY`
- **Access**: Public
- **Response**: Binary streaming response with auto-detected Content-Type (`video/mp4`, `application/pdf`, etc.) and `Cache-Control: public, max-age=86400`.

---

## 7. System Health Endpoint (`/api/health`)

Monitors database connectivity and environment health.
- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Access**: Public
- **Response**:
  ```json
  {
    "status": "ok",
    "server": "running",
    "database": "connected",
    "databaseConnected": true,
    "mongoConfigured": true,
    "mongoType": "MongoDB Atlas (Cloud)",
    "environment": "production",
    "time": "2026-10-26T17:45:00.000Z"
  }
  ```
