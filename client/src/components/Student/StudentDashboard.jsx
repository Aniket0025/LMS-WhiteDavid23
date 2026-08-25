import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  CheckCircle,
  Calendar,
  Target,
  Star,
  Search,
  Grid,
  List,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
  Compass,
  Zap,
  CheckCircle2,
  Flame,
  GraduationCap
} from 'lucide-react';
import { getEnrolledCourses, getUserStats } from '../../Api/userApi';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [coursesResponse, statsResponse] = await Promise.all([
        getEnrolledCourses(),
        getUserStats()
      ]);

      if (coursesResponse.success) {
        setEnrolledCourses(coursesResponse.courses || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats || {
          enrolledCourses: coursesResponse.courses?.length || 0,
          completedCourses: 0,
          totalHours: 0,
          currentStreak: 1
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = (courseId) => {
    if (courseId) {
      navigate(`/course/${courseId}/learn`);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-emerald-500 to-teal-400';
    if (progress >= 50) return 'from-blue-500 to-indigo-500';
    if (progress >= 25) return 'from-amber-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'in-progress') return matchesSearch && course.progress > 0 && course.progress < 100;
    if (filterStatus === 'completed') return matchesSearch && (course.isCompleted || course.progress === 100);
    if (filterStatus === 'not-started') return matchesSearch && (course.progress === 0 || !course.progress);
    
    return matchesSearch;
  });

  // Most recently accessed course
  const lastAccessedCourse = enrolledCourses.slice().sort((a, b) => {
    return new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0);
  })[0];

  // Calculate overall average progress
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl max-w-sm w-full mx-4 shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center"></div>
            <GraduationCap className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading LMS Portal</h3>
          <p className="text-slate-400 text-sm">Preparing your dashboard & progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Unable to Load Dashboard</h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100 pt-[70px] sm:pt-[76px] overflow-x-hidden w-full max-w-full">
      <div className="container mx-auto px-2.5 sm:px-6 lg:px-8 pb-20 max-w-7xl w-full min-w-0">
        
        {/* Welcome Hero Banner */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-slate-700/60 p-4 sm:p-8 lg:p-10 shadow-2xl mb-6 sm:mb-8 group w-full min-w-0"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl group-hover:bg-blue-600/25 transition-all duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl group-hover:bg-purple-600/25 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6 min-w-0">
            <div className="space-y-2.5 sm:space-y-3 min-w-0 flex-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-blue-400 max-w-full truncate">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Student Learning Portal</span>
                {user?.role === 'educator' && (
                  <span className="ml-1 pl-2 border-l border-blue-500/30 text-purple-400 shrink-0">Educator Mode</span>
                )}
              </div>
              
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug break-words">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Learner'}</span>! 👋
              </h1>
              
              <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
                Ready to level up your skills today? Track your ongoing courses, complete daily goals, and achieve certifications.
              </p>
            </div>

            {/* Banner Right: Quick Progress Ring / Card */}
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-3.5 sm:p-5 rounded-2xl shrink-0 self-stretch sm:self-start lg:self-center min-w-0 max-w-full">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" className="text-slate-700 sm:hidden" fill="transparent" />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="22" 
                    stroke="currentColor" 
                    strokeWidth="5" 
                    className="text-blue-500 transition-all duration-1000 ease-out sm:hidden" 
                    fill="transparent"
                    strokeDasharray={138.23}
                    strokeDashoffset={138.23 - (138.23 * avgProgress) / 100}
                    strokeLinecap="round"
                  />
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className="text-slate-700 hidden sm:block" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    className="text-blue-500 transition-all duration-1000 ease-out hidden sm:block" 
                    fill="transparent"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * avgProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{avgProgress}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Overall Completion</p>
                <h4 className="text-xs sm:text-lg font-bold text-white truncate">{enrolledCourses.filter(c => c.isCompleted || c.progress === 100).length} of {enrolledCourses.length} Completed</h4>
                <p className="text-[11px] sm:text-xs text-blue-400 font-medium truncate">Keep up the momentum!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 mb-6 sm:mb-10 w-full min-w-0"
        >
          {/* Card 1: Enrolled Courses */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-4 min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Enrolled</span>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                <BookOpen className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 min-w-0">
              <h3 className="text-xl sm:text-3xl font-black text-white truncate">{stats.enrolledCourses || enrolledCourses.length}</h3>
              <span className="text-[9px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit shrink-0">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-2 hidden sm:block truncate">Courses in library</p>
          </div>

          {/* Card 2: Completed Courses */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/40 rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-4 min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Completed</span>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 min-w-0">
              <h3 className="text-xl sm:text-3xl font-black text-white truncate">{stats.completedCourses || enrolledCourses.filter(c => c.isCompleted || c.progress === 100).length}</h3>
              <span className="text-[9px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit shrink-0">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Done
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-2 hidden sm:block truncate">Finished courses</p>
          </div>

          {/* Card 3: Learning Hours */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-4 min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Hours</span>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 min-w-0">
              <h3 className="text-xl sm:text-3xl font-black text-white truncate">{stats.totalHours || '12'}h</h3>
              <span className="text-[9px] sm:text-xs text-purple-400 font-medium flex items-center gap-1 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-500/20 w-fit shrink-0">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Total
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-2 hidden sm:block truncate">Learning time</p>
          </div>

          {/* Card 4: Learning Streak */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/40 rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-4 min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Streak</span>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 min-w-0">
              <h3 className="text-xl sm:text-3xl font-black text-white truncate">{stats.currentStreak || 1} Days</h3>
              <span className="text-[9px] sm:text-xs text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/20 w-fit shrink-0">
                🔥 Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-2 hidden sm:block truncate">Consecutive days</p>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 min-w-0 w-full">
          
          {/* Left Column: Courses Catalog */}
          <div className="lg:col-span-2 space-y-6 min-w-0 w-full">
            
            {/* Filter & Search Header Card */}
            <motion.div
              id="my-courses"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3.5 sm:p-5 w-full min-w-0 overflow-hidden"
            >
              <div className="flex flex-col gap-3.5 min-w-0">
                
                {/* Title & View Toggle Row */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 truncate">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
                      <span className="truncate">My Enrolled Courses</span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                      Showing {filteredCourses.length} of {enrolledCourses.length} total courses
                    </p>
                  </div>

                  {/* View Mode Toggle Switch */}
                  <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-700/70 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">List</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter Pills (Responsive 2x2 Grid on Mobile) */}
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-1.5 sm:gap-2 w-full min-w-0">
                  {[
                    { id: 'all', label: 'All Courses' },
                    { id: 'in-progress', label: 'In Progress' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'not-started', label: 'Not Started' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition-all duration-200 min-w-0 truncate ${
                        filterStatus === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-500/30'
                          : 'bg-slate-900/60 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate block">{tab.label}</span>
                    </button>
                  ))}
                </div>

              </div>
            </motion.div>

            {/* Courses Display */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0' : 'space-y-4 w-full min-w-0'}
            >
              {filteredCourses.length === 0 ? (
                <div className="col-span-full bg-slate-800/30 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8 sm:p-12 text-center w-full min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 text-blue-400">
                    <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    {enrolledCourses.length === 0 ? 'No Enrolled Courses Found' : 'No Matching Courses'}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {enrolledCourses.length === 0 
                      ? 'You have not enrolled in any courses yet. Browse our extensive course catalog to find your next skill!'
                      : 'No courses match your current search query or status filter. Try clearing filters to see all courses.'
                    }
                  </p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/20 inline-flex items-center space-x-2 text-xs sm:text-sm"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Catalog</span>
                  </button>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 min-w-0 w-full ${
                      viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col sm:flex-row items-start sm:items-center p-3.5 sm:p-4 gap-3 sm:gap-4'
                    }`}
                  >
                    {/* Grid View Layout */}
                    {viewMode === 'grid' ? (
                      <>
                        {/* Thumbnail Header */}
                        <div className="relative h-40 sm:h-44 bg-slate-900 overflow-hidden w-full">
                          {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                              <BookOpen className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                            <span className="px-2 py-0.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-lg text-white text-[10px] font-semibold truncate max-w-[65%]">
                              {course.category || 'General'}
                            </span>
                            <div className="flex items-center space-x-1 px-2 py-0.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-lg text-amber-400 text-[11px] font-bold shrink-0">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{course.rating || '4.8'}</span>
                            </div>
                          </div>

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                            <button 
                              onClick={() => handleStartLearning(course.id)}
                              className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-blue-500"
                            >
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 min-w-0">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-snug break-words">
                              {course.title}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 min-w-0 truncate">
                              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{course.instructor || 'Course Instructor'}</span>
                            </p>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-700/40 min-w-0">
                            <div className="flex items-center justify-between text-xs min-w-0">
                              <span className="text-slate-400 font-medium truncate">Progress</span>
                              <span className="text-white font-bold shrink-0 ml-1">{course.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)} transition-all duration-500`}
                                style={{ width: `${course.progress || 0}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 min-w-0 pt-0.5">
                              <span className="truncate shrink-0">{course.completedLessons || 0}/{course.totalLessons || 10} lessons</span>
                              <span className="text-slate-400 shrink-0 min-w-0">
                                {course.isCompleted || course.progress === 100 ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" /> <span className="truncate">Completed</span>
                                  </span>
                                ) : (
                                  <span className="truncate">In Progress</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Action CTA */}
                          <button 
                            onClick={() => handleStartLearning(course.id)}
                            className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                              course.isCompleted || course.progress === 100
                                ? 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>{course.isCompleted || course.progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* List View Layout */
                      <>
                        <div className="w-full sm:w-32 h-32 sm:h-24 bg-slate-900 rounded-xl overflow-hidden shrink-0 relative">
                          {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                              <BookOpen className="w-8 h-8 text-white/30" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">by {course.instructor || 'Instructor'}</p>
                          
                          <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50 min-w-0">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)}`}
                                style={{ width: `${course.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-white shrink-0 min-w-[2.5rem]">{course.progress || 0}%</span>
                          </div>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                          <button 
                            onClick={() => handleStartLearning(course.id)}
                            className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Continue</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="space-y-6 min-w-0 w-full">

            {/* Resume Last Course Jump Card */}
            {lastAccessedCourse && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full min-w-0"
              >
                <div className="flex items-center justify-between mb-3 min-w-0">
                  <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold flex items-center gap-1 max-w-full truncate">
                    <Zap className="w-3 h-3 shrink-0" /> <span className="truncate">Continue Where You Left Off</span>
                  </span>
                </div>
                
                <h4 className="text-base sm:text-lg font-bold text-white truncate mb-1">{lastAccessedCourse.title}</h4>
                <p className="text-slate-300 text-xs mb-3.5 truncate">Instructor: {lastAccessedCourse.instructor || 'Instructor'}</p>

                <div className="space-y-1.5 mb-4 sm:mb-5 min-w-0">
                  <div className="flex justify-between text-xs text-slate-300 min-w-0">
                    <span className="truncate">Course Progress</span>
                    <span className="font-bold text-blue-400 shrink-0 ml-1">{lastAccessedCourse.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(lastAccessedCourse.progress || 0)}`}
                      style={{ width: `${lastAccessedCourse.progress || 0}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleStartLearning(lastAccessedCourse.id)}
                  className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                  <span>Resume Course</span>
                </button>
              </motion.div>
            )}

            {/* Weekly Activity & Learning Goals */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.6 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full min-w-0"
            >
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 truncate">
                <Target className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Learning Milestones</span>
              </h3>
              
              <div className="space-y-3 min-w-0">
                <div className="p-3 sm:p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-semibold truncate">Course Completion</p>
                      <p className="text-slate-400 text-[11px] truncate">Goal: 5 Courses</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0 whitespace-nowrap">
                    {Math.min(stats.completedCourses || 0, 5)} / 5
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-semibold truncate">Study Target</p>
                      <p className="text-slate-400 text-[11px] truncate">Goal: 30 Hours</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 shrink-0 whitespace-nowrap">
                    {Math.min(stats.totalHours || 12, 30)} / 30h
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-semibold truncate">Weekly Streak</p>
                      <p className="text-slate-400 text-[11px] truncate">Goal: 7 Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0 whitespace-nowrap">
                    {Math.min(stats.currentStreak || 1, 7)} / 7d
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Panel */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.7 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full min-w-0"
            >
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 truncate">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <span>Quick Actions</span>
              </h3>
              
              <div className="space-y-2.5 sm:space-y-3 min-w-0">
                <button 
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-md text-white font-medium text-xs group min-w-0 gap-2"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span className="truncate text-left">Explore New Courses</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
                
                <button 
                  onClick={() => navigate('/student/account')}
                  className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-2xl hover:bg-slate-800 transition-all duration-200 text-slate-300 hover:text-white font-medium text-xs group min-w-0 gap-2"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <User className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate text-left">Account & Security Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-slate-500 group-hover:text-white shrink-0" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;