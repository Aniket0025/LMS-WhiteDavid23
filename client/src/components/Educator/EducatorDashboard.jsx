import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Users, 
  TrendingUp,
  BarChart3,
  ArrowRight,
  Target,
  Clock,
  Star,
  AlertCircle,
  IndianRupee,
  Sparkles,
  Award,
  CheckCircle2,
  FileEdit,
  GraduationCap,
  ChevronRight,
  Zap
} from 'lucide-react';
import { getEducatorCourses } from '../../Api/courseApi.js';
import { getAllStudentsAndEducators } from '../../Api/userApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const EducatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 4.8
  });
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalEducators: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [coursesResponse, platformResponse] = await Promise.all([
        getEducatorCourses(),
        getAllStudentsAndEducators()
      ]);
      
      if (coursesResponse.success) {
        const userCourses = coursesResponse.courses || [];
        setCourses(userCourses);
        
        const totalStudents = userCourses.reduce((total, course) => 
          total + (course.enrolledStudents?.length || 0), 0
        );
        const totalRevenue = userCourses.reduce((total, course) => 
          total + ((course.price || 0) * (course.enrolledStudents?.length || 0)), 0
        );
        const publishedCount = userCourses.filter(c => c.isPublished).length;
        const draftCount = userCourses.length - publishedCount;

        // Calculate weighted average rating
        const ratedCourses = userCourses.filter(c => c.rating);
        const avgRating = ratedCourses.length > 0
          ? (ratedCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedCourses.length).toFixed(1)
          : 4.8;
        
        setStats({
          totalCourses: userCourses.length,
          publishedCourses: publishedCount,
          draftCourses: draftCount,
          totalStudents,
          totalRevenue,
          avgRating
        });
      }

      if (platformResponse) {
        const payload = platformResponse?.data ?? platformResponse;
        let allUsers = [];
        
        if (Array.isArray(payload)) {
          allUsers = payload;
        } else if (payload.data && Array.isArray(payload.data)) {
          allUsers = payload.data;
        } else {
          allUsers = payload.students ?? payload.users ?? [];
        }
        
        const students = allUsers.filter(u => u.role === 'student');
        const educators = allUsers.filter(u => u.role === 'educator');
        
        setPlatformStats({
          totalStudents: students.length,
          totalEducators: educators.length
        });
      }
    } catch (err) {
      console.error('Error fetching educator dashboard:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Main feature navigation sections
  const dashboardSections = [
    {
      title: 'Create New Course',
      description: 'Design curriculum, upload video lectures, and launch new learning experiences.',
      icon: Plus,
      path: '/educator/add-course',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      ctaText: 'Launch Course Creation'
    },
    {
      title: 'Course Management',
      description: 'View all published courses, draft lessons, edit content, and update pricing.',
      icon: BookOpen,
      path: '/educator/all-courses',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      ctaText: 'Manage All Courses'
    },
    {
      title: 'Analytics & Revenue',
      description: 'Track course enrollments, revenue streams, ratings, and student completion metrics.',
      icon: BarChart3,
      path: '/educator/analytics',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      ctaText: 'View Deep Analytics'
    },
    {
      title: 'Student Provisioning',
      description: 'Enrol students into courses, manage student accounts, and inspect progress.',
      icon: Users,
      path: '/educator/students',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      ctaText: 'Manage Students'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl max-w-sm w-full mx-4 shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center"></div>
            <GraduationCap className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Educator Hub</h3>
          <p className="text-slate-400 text-sm">Preparing your instructor metrics & courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 pt-6 sm:pt-8 pb-16 overflow-x-hidden text-slate-100">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl w-full">
        
        {/* Welcome Header Banner */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-slate-700/60 p-6 sm:p-8 lg:p-10 shadow-2xl mb-8 group"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl group-hover:bg-blue-600/25 transition-all duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl group-hover:bg-purple-600/25 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md text-xs font-semibold text-purple-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Educator Portal</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Educator'}</span>! 👨‍🏫
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Welcome to your instructor command center. Monitor course performance, manage enrolled students, and publish world-class learning content.
              </p>
            </div>

            {/* Banner Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
              <button
                onClick={() => navigate('/educator/add-course')}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        {/* Key Metrics Grid */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10"
        >
          {/* Card 1: Total Courses */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Courses</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-xl sm:text-3xl font-black text-white">{stats.totalCourses}</h3>
              <span className="text-[10px] sm:text-xs text-blue-400 font-medium flex items-center gap-1 bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-500/20">
                {stats.publishedCourses} Pub
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-1.5 sm:mt-2 truncate">{stats.draftCourses} drafts in progress</p>
          </div>

          {/* Card 2: Enrolled Students */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Enrolments</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-xl sm:text-3xl font-black text-white">{stats.totalStudents}</h3>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-1.5 sm:mt-2 truncate">{platformStats.totalStudents} platform users</p>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Revenue</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-xl sm:text-3xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</h3>
              <span className="text-[10px] sm:text-xs text-purple-400 font-medium flex items-center gap-1 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-500/20">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Sales
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-1.5 sm:mt-2 truncate">Course revenue</p>
          </div>

          {/* Card 4: Instructor Rating */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Rating</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-xl sm:text-3xl font-black text-white">{stats.avgRating} <span className="text-sm font-normal text-amber-400">★</span></h3>
              <span className="text-[10px] sm:text-xs text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/20">
                Top Rated
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-1.5 sm:mt-2 truncate">Student feedback</p>
          </div>
        </motion.div>

        {/* Feature Hub Cards Grid */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {dashboardSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.title}
                onClick={() => navigate(section.path)}
                className={`group cursor-pointer ${section.bgColor} ${section.borderColor} border backdrop-blur-xl rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between hover:shadow-2xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 bg-gradient-to-r ${section.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {section.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>{section.ctaText}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Recent Courses Management & Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Recent Courses List */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    Your Recent Courses
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Manage and edit your course materials</p>
                </div>

                <Link
                  to="/educator/all-courses"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 bg-blue-500/10 px-3.5 py-2 rounded-xl border border-blue-500/20"
                >
                  <span>View All Courses ({courses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-700/40 p-8">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No Courses Created Yet</h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto mb-6 leading-relaxed">
                    You have not published or created any courses yet. Click below to start building your first course curriculum!
                  </p>
                  <button
                    onClick={() => navigate('/educator/add-course')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Course</span>
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <div
                      key={course._id}
                      className="group bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Course Thumbnail */}
                        <div className="h-36 bg-slate-950 relative overflow-hidden">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                              <BookOpen className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                          
                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${
                              course.isPublished 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-blue-400" />
                              <span>{course.enrolledStudents?.length || 0} enrolled</span>
                            </span>
                            <span className="font-bold text-white">
                              {course.price ? `₹${course.price}` : 'Free'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => navigate(`/educator/course/${course._id}/manage`)}
                          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5 border border-slate-700 hover:border-blue-500"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Manage & Edit Course</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Quick Navigation & Educator Tips */}
          <div className="space-y-6">
            
            {/* Quick Actions Panel */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/educator/add-course')}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 text-white font-semibold text-xs shadow-md group"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-4 h-4" />
                    <span>Create New Course</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/educator/students')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-2xl hover:bg-slate-800 transition-all duration-200 text-slate-300 hover:text-white font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Manage Students</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-slate-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => navigate('/educator/analytics')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-2xl hover:bg-slate-800 transition-all duration-200 text-slate-300 hover:text-white font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Analytics Overview</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-slate-500 group-hover:text-white" />
                </button>
              </div>
            </motion.div>

            {/* Educator Teaching Inspiration Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-xl text-center"
            >
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                <Target className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Expand Your Impact</h4>
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Publishing regular updates & new modules boosts student retention and ratings. Keep your curriculum fresh!
              </p>
              <button
                onClick={() => navigate('/educator/add-course')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Curriculum</span>
              </button>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EducatorDashboard;
