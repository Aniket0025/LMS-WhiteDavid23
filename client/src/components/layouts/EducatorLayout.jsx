import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard,
  Plus,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  ChevronDown
} from 'lucide-react';

const EducatorLayout = () => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication or loading user data
  if (loading || (isLoggedIn && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has educator or admin role
  if (!user?.role || (user.role !== 'educator' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center pt-24">
        <div className="max-w-md mx-auto text-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Educator / Admin Access Required</h2>
          <p className="text-slate-400 mb-6">
            This area is restricted to educators and administrators only. Please contact support if you believe this is an error.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Navigation items for educator
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/educator/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Create Course',
      href: '/educator/add-course',
      icon: Plus
    },
    {
      name: 'All Courses',
      href: '/educator/all-courses',
      icon: BookOpen
    },
    {
      name: 'Analytics',
      href: '/educator/analytics',
      icon: BarChart3
    },
    {
      name: 'Students',
      href: '/educator/students',
      icon: Users
    }
  ];

  // Check if current path matches navigation item
  const isActiveRoute = (href) => {
    if (href === '/educator/dashboard' && location.pathname === '/educator') {
      return true;
    }
    return location.pathname === href;
  };

  // Render nested routes for educators
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 w-full max-w-full overflow-x-hidden pt-[104px] sm:pt-[108px] pb-12">
      <Outlet />
    </div>
  );
};

export default EducatorLayout;
