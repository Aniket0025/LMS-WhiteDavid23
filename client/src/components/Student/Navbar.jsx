import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  Plus,
  BarChart3,
  Users,
  Sparkles,
  GraduationCap,
  Compass
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../Api/authApi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();

  const isEducatorPath = location.pathname.startsWith('/educator');
  const isStudentPath = location.pathname.startsWith('/student');

  const educatorNavItems = [
    { name: 'Dashboard', href: '/educator/dashboard', icon: LayoutDashboard },
    { name: 'Create Course', href: '/educator/add-course', icon: Plus },
    { name: 'All Courses', href: '/educator/all-courses', icon: BookOpen },
    { name: 'Analytics', href: '/educator/analytics', icon: BarChart3 },
    { name: 'Students', href: '/educator/students', icon: Users },
  ];

  const studentNavItems = [
    { name: 'My Learning', href: '/student/dashboard', icon: BookOpen },
    { name: 'Account Settings', href: '/student/account', icon: Settings },
    { name: 'Browse Courses', href: '/course', icon: Compass },
  ];
  if (user?.role === 'educator' || user?.role === 'admin') {
    studentNavItems.push({ 
      name: user?.role === 'admin' ? 'Admin Hub' : 'Educator Hub', 
      href: '/educator/dashboard', 
      icon: Sparkles 
    });
  }

  // Refs for click outside detection
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = event.target.closest('[data-mobile-menu-button]');
        if (!menuButton) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileDropdown(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      setShowProfileDropdown(false);
      setIsMenuOpen(false);
    }
  };

  // Toggle dropdown with better state management
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60 z-50 shadow-xl"
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 overflow-hidden rounded-xl shrink-0">
                <img 
                  src="/login.png" 
                  alt="whitedavid23 Logo" 
                  className="w-full h-full object-contain scale-[2.7] transition-transform duration-300 group-hover:scale-[3.0]" 
                />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight shrink-0">
                whitedavid<span className="text-blue-400">23</span>
              </span>
            </Link>

            {isEducatorPath && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-purple-500/10 text-purple-300 border border-purple-500/25">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Instructor Hub</span>
              </span>
            )}
          </div>

          {/* Center: Context-Aware Desktop Navigation */}
          {!isEducatorPath && (
            /* Standard Desktop Navigation */
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'text-white bg-slate-800/70 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Home
              </Link>
              <Link
                to="/course"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  location.pathname === '/course'
                    ? 'text-white bg-slate-800/70 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Explore Courses
              </Link>
              <Link
                to="/about"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  location.pathname === '/about'
                    ? 'text-white bg-slate-800/70 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                About Us
              </Link>
              {isLoggedIn && (
                <Link
                  to="/student/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    location.pathname.startsWith('/student')
                      ? 'text-white bg-slate-800/70 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  My Learning
                </Link>
              )}
              {isLoggedIn && (user?.role === 'educator' || user?.role === 'admin') && (
                <Link
                  to="/educator/dashboard"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 hover:border-purple-400/60 transition-all ml-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{user?.role === 'admin' ? 'Admin Hub' : 'Educator Hub'}</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isEducatorPath && (
              <Link
                to="/student/dashboard"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition-all"
                title="Switch to Student View"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Student View</span>
              </Link>
            )}

            {/* Search Icon */}
            <Link
              to="/search"
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
              title="Search Courses"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </Link>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name || 'Profile'}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-200 shadow-lg border-2 border-slate-700"
                        />
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg ${
                          user?.role === 'admin'
                            ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                            : user?.role === 'educator'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600'
                          }`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        user?.role === 'admin'
                          ? 'bg-amber-400'
                          : user?.role === 'educator'
                          ? 'bg-purple-500'
                          : 'bg-green-500'
                        }`}></div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${showProfileDropdown ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-700/50">
                          <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user?.name || 'Profile'}
                                className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-slate-600"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                user?.role === 'admin'
                                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                                  : user?.role === 'educator'
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
                                }`}>
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-semibold text-lg">
                                {user?.name || "User"}
                              </p>
                              <p className="text-slate-400 text-sm">{user?.email}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  user?.role === 'admin'
                                    ? 'bg-amber-400'
                                    : user?.role === 'educator'
                                    ? 'bg-purple-500'
                                    : 'bg-blue-500'
                                }`}></div>
                                <span className={`text-xs font-medium capitalize ${
                                  user?.role === 'admin'
                                    ? 'text-amber-400'
                                    : user?.role === 'educator'
                                    ? 'text-purple-400'
                                    : 'text-blue-400'
                                }`}>
                                  {user?.role || 'Student'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="p-2">
                          {(user?.role === 'educator' || user?.role === 'admin') ? (
                            // Educator / Admin Navigation - can access both dashboards
                            <>
                              <Link
                                to="/educator/dashboard"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 p-4 text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                              >
                                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-purple-400" />
                                <div>
                                  <span className="font-medium">{user?.role === 'admin' ? 'Admin Dashboard' : 'Educator Dashboard'}</span>
                                  <p className="text-xs text-slate-500">Manage courses and students</p>
                                </div>
                              </Link>

                              <Link
                                to="/student/dashboard"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                              >
                                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-blue-400" />
                                <div>
                                  <span className="font-medium">Student Dashboard</span>
                                  <p className="text-xs text-slate-500">View enrolled courses</p>
                                </div>
                              </Link>
                            </>
                          ) : (
                            // Student Navigation - only student dashboard
                            <Link
                              to="/student/dashboard"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                            >
                              <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-blue-400" />
                              <div>
                                <span className="font-medium">Student Dashboard</span>
                                <p className="text-xs text-slate-500">View your courses</p>
                              </div>
                            </Link>
                          )}

                          <Link
                            to={user?.role === 'educator' ? "/student/account" : "/student/account"}
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <Settings className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-slate-300" />
                            <div>
                              <span className="font-medium">Account Settings</span>
                              <p className="text-xs text-slate-500">Manage your profile</p>
                            </div>
                          </Link>



                          <hr className="border-slate-700/50 my-3" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-left group"
                          >
                            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-red-400" />
                            <div>
                              <span className="font-medium">Sign Out</span>
                              <p className="text-xs text-slate-500">Logout from account</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Action Bar */}
          <div className="flex md:hidden items-center space-x-1.5 sm:space-x-2">
            {/* Quick Search Button */}
            <Link
              to="/search"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              title="Search Courses"
            >
              <Search className="w-5 h-5 text-slate-300" />
            </Link>

            {/* Quick Auth / Avatar Button */}
            {isLoggedIn ? (
              <button
                onClick={toggleMobileMenu}
                className="relative p-0.5 focus:outline-none"
                title="Profile Menu"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-md"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    user?.role === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                      : user?.role === 'educator'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                  user?.role === 'admin'
                    ? 'bg-amber-400'
                    : user?.role === 'educator'
                    ? 'bg-purple-500'
                    : 'bg-green-500'
                }`} />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              data-mobile-menu-button
              className="p-2 text-slate-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-slate-900/98 backdrop-blur-2xl border-t border-slate-800/80 max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain shadow-2xl"
            >
              <div className="p-6 space-y-4">
                {/* Search */}
                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                >
                  <Search className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-base">Search Courses</span>
                </Link>

                {isLoggedIn ? (
                  <>
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user?.name || 'Profile'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-lg"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            user?.role === 'admin'
                              ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                              : user?.role === 'educator'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600'
                          }`}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium text-base">{user?.name || "User"}</p>
                          <p className="text-slate-400 text-sm">{user?.email}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              user?.role === 'admin'
                                ? 'bg-amber-400'
                                : user?.role === 'educator'
                                ? 'bg-purple-500'
                                : 'bg-blue-500'
                            }`}></div>
                            <span className={`text-xs font-medium capitalize ${
                              user?.role === 'admin'
                                ? 'text-amber-400'
                                : user?.role === 'educator'
                                ? 'text-purple-400'
                                : 'text-blue-400'
                            }`}>
                              {user?.role || 'Student'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                      {(user?.role === 'educator' || user?.role === 'admin') ? (
                        // Educator / Admin Mobile Navigation - can access both dashboards
                        <>
                          <Link
                            to="/educator/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-purple-400" />
                            <span className="font-medium text-base">{user?.role === 'admin' ? 'Admin Dashboard' : 'Educator Dashboard'}</span>
                          </Link>

                          <Link
                            to="/student/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-blue-400" />
                            <span className="font-medium text-base">Student Dashboard</span>
                          </Link>
                        </>
                      ) : (
                        // Student Mobile Navigation - only student dashboard
                        <Link
                          to="/student/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                        >
                          <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-blue-400" />
                          <span className="font-medium text-base">Student Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/student/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                      >
                        <Settings className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-slate-300" />
                        <span className="font-medium text-base">Account Settings</span>
                      </Link>

                      <hr className="border-slate-700/50 my-4" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-4 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-left group"
                      >
                        <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 text-red-400" />
                        <span className="font-medium text-base">Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center transform hover:scale-[1.02] shadow-lg"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tier 2: Educator Sub-Navigation Bar - Integrated with ZERO gap */}
      {isEducatorPath && (
        <div className="border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-xl">
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1.5 sm:py-2 scrollbar-none" aria-label="Educator Navigation">
              {educatorNavItems.map((item) => {
                const active = location.pathname === item.href || (item.href === '/educator/dashboard' && location.pathname === '/educator');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 whitespace-nowrap ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Tier 2: Student Sub-Navigation Bar - Integrated with ZERO gap */}
      {isStudentPath && (
        <div className="border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-xl">
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1.5 sm:py-2 scrollbar-none" aria-label="Student Navigation">
              {studentNavItems.map((item) => {
                const active = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 whitespace-nowrap ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
