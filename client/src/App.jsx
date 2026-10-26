import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Student/Navbar.jsx';
import Home from './pages/Home.jsx';
import PWAInstallPrompt from './components/common/PWAInstallPrompt.jsx';
import PWAOfflineIndicator from './components/common/PWAOfflineIndicator.jsx';
import PWAUpdateToast from './components/common/PWAUpdateToast.jsx';
import './index.css';

// Code-split routes to dramatically reduce initial bundle size and speed up page load
const Login = lazy(() => import('./components/Student/Login.jsx'));
const Signup = lazy(() => import('./components/Student/Signup.jsx'));
const ForgotPassword = lazy(() => import('./components/Student/ForgotPassword.jsx'));
const ForgotPasswordOTP = lazy(() => import('./components/Student/ForgotPasswordOTP.jsx'));
const ResetPassword = lazy(() => import('./components/Student/ResetPassword.jsx'));
const OTPVerification = lazy(() => import('./components/Student/OTPVerification.jsx'));
const Search = lazy(() => import('./components/Student/Search.jsx'));
const CourseDetails = lazy(() => import('./components/course/CourseDetails.jsx'));
const CourseLearn = lazy(() => import('./components/course/CourseLearn.jsx'));
const AllCourse = lazy(() => import('./components/course/AllCourse.jsx'));
const About = lazy(() => import('./components/Student/About.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Student dashboard routes
const StudentLayout = lazy(() => import('./components/layouts/StudentLayout.jsx'));
const StudentAccount = lazy(() => import('./components/Student/StudentAccount.jsx'));
const StudentDashboard = lazy(() => import('./components/Student/StudentDashboard.jsx'));

// Educator studio routes
const EducatorLayout = lazy(() => import('./components/layouts/EducatorLayout.jsx'));
const EducatorDashboard = lazy(() => import('./components/Educator/EducatorDashboard.jsx'));
const EducatorAddCourse = lazy(() => import('./components/Educator/EducatorAddCourse.jsx'));
const EducatorAllCourse = lazy(() => import('./components/Educator/EducatorAllCourse.jsx'));
const EducatorEditAndDeleteCourse = lazy(() => import('./components/Educator/EducatorEditAndDeleteCourse.jsx'));
const EducatorAnalytics = lazy(() => import('./components/Educator/EducatorAnalytics.jsx'));
const EducatorStudents = lazy(() => import('./components/Educator/EducatorStudents.jsx'));

// Ultra-fast lightweight fallback loader
const PageFallback = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="relative flex items-center justify-center w-12 h-12">
      <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
    </div>
    <span className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
      Loading
    </span>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* PWA Enhancements: Real-time offline detection, smart install prompt, and seamless updates */}
        <PWAOfflineIndicator />
        <PWAInstallPrompt />
        <PWAUpdateToast />

        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Learning classroom route without navbar */}
            <Route path="/course/:id/learn" element={<CourseLearn />} />
            
            {/* Regular routes with navbar */}
            <Route path="*" element={
              <div>
                <Navbar />
                <div className="bg-slate-950 min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/forgot-password/verify-otp" element={<ForgotPasswordOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/course/:id" element={<CourseDetails />} />
                    <Route path="/course" element={<AllCourse />} />
                    <Route path="*" element={<NotFound />} />
                    
                    {/* Student Routes - Protected by StudentLayout */}
                    <Route path="/student" element={<StudentLayout />}>
                      <Route path="account" element={<StudentAccount />} />
                      <Route path="dashboard" element={<StudentDashboard />} />
                    </Route>

                    {/* Educator Routes - Protected by EducatorLayout */}
                    <Route path="/educator" element={<EducatorLayout />}>
                      <Route index element={<EducatorDashboard />} />
                      <Route path="dashboard" element={<EducatorDashboard />} />
                      <Route path="add-course" element={<EducatorAddCourse />} />
                      <Route path="all-courses" element={<EducatorAllCourse />} />
                      <Route path="edit-course/:id" element={<EducatorEditAndDeleteCourse />} />
                      <Route path="course/:id/manage" element={<EducatorEditAndDeleteCourse />} />
                      <Route path="analytics" element={<EducatorAnalytics />} />
                      <Route path="students" element={<EducatorStudents />} />
                    </Route>
                  </Routes>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;