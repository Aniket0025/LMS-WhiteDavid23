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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl">
        
        {/* Welcome Hero Banner */}
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
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-xs font-semibold text-blue-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Student Learning Portal</span>
                {user?.role === 'educator' && (
                  <span className="ml-1 pl-2 border-l border-blue-500/30 text-purple-400">Educator Mode</span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Learner'}</span>! 👋
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Ready to level up your skills today? Track your ongoing courses, complete daily goals, and achieve certifications.
              </p>
            </div>

            {/* Banner Right: Quick Progress Ring / Card */}
            <div className="flex items-center gap-4 bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-4 sm:p-5 rounded-2xl shrink-0 self-start lg:self-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className="text-slate-700" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    className="text-blue-500 transition-all duration-1000 ease-out" 
                    fill="transparent"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * avgProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{avgProgress}%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Completion</p>
                <h4 className="text-lg font-bold text-white">{enrolledCourses.filter(c => c.isCompleted || c.progress === 100).length} of {enrolledCourses.length} Completed</h4>
                <p className="text-xs text-blue-400 font-medium">Keep up the momentum!</p>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10"
        >
          {/* Card 1: Enrolled Courses */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-white">{stats.enrolledCourses || enrolledCourses.length}</h3>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">Courses in your learning library</p>
          </div>

          {/* Card 2: Completed Courses */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/40 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-white">{stats.completedCourses || enrolledCourses.filter(c => c.isCompleted || c.progress === 100).length}</h3>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Award className="w-3 h-3" /> Certified
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">Successfully finished courses</p>
          </div>

          {/* Card 3: Learning Hours */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Learning Hours</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-white">{stats.totalHours || '12'}h</h3>
              <span className="text-xs text-purple-400 font-medium flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                <Zap className="w-3 h-3" /> Total
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">Hours spent mastering topics</p>
          </div>

          {/* Card 4: Learning Streak */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/40 rounded-2xl p-5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Streak</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-white">{stats.currentStreak || 1} Days</h3>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                🔥 On Fire
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">Consecutive days active</p>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Courses Catalog */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter & Search Header Card */}
            <motion.div
              id="my-courses"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                      My Enrolled Courses
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing {filteredCourses.length} of {enrolledCourses.length} total courses
                    </p>
                  </div>

                  {/* View Mode Toggle Switch */}
                  <div className="flex items-center space-x-1 bg-slate-900/60 border border-slate-700/70 rounded-xl p-1 self-start sm:self-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
                  
                  {/* Status Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: 'All Courses' },
                      { id: 'in-progress', label: 'In Progress' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'not-started', label: 'Not Started' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                          filterStatus === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-500/30'
                            : 'bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/60 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>

            {/* Courses Display */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className={viewMode === 'grid' ? 'grid sm:grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}
            >
              {filteredCourses.length === 0 ? (
                <div className="col-span-full bg-slate-800/30 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-400">
                    <Compass className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {enrolledCourses.length === 0 ? 'No Enrolled Courses Found' : 'No Matching Courses'}
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {enrolledCourses.length === 0 
                      ? 'You have not enrolled in any courses yet. Browse our extensive course catalog to find your next skill!'
                      : 'No courses match your current search query or status filter. Try clearing filters to see all courses.'
                    }
                  </p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/20 inline-flex items-center space-x-2 text-sm"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Catalog</span>
                  </button>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ${
                      viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col sm:flex-row items-center p-4 gap-4'
                    }`}
                  >
                    {/* Grid View Layout */}
                    {viewMode === 'grid' ? (
                      <>
                        {/* Thumbnail Header */}
                        <div className="relative h-44 bg-slate-900 overflow-hidden">
                          {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                              <BookOpen className="w-14 h-14 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg text-white text-[11px] font-semibold">
                              {course.category || 'General'}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg text-amber-400 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{course.rating || '4.8'}</span>
                            </div>
                          </div>

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                            <button 
                              onClick={() => handleStartLearning(course.id)}
                              className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-blue-500"
                            >
                              <Play className="w-6 h-6 ml-1 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span>{course.instructor || 'Course Instructor'}</span>
                            </p>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2 pt-2 border-t border-slate-700/40">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Progress</span>
                              <span className="text-white font-bold">{course.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)} transition-all duration-500`}
                                style={{ width: `${course.progress || 0}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>{course.completedLessons || 0}/{course.totalLessons || 10} lessons</span>
                              <span className="text-slate-400">
                                {course.isCompleted || course.progress === 100 ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                  </span>
                                ) : (
                                  <span>In Progress</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Action CTA */}
                          <button 
                            onClick={() => handleStartLearning(course.id)}
                            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center space-x-2 ${
                              course.isCompleted || course.progress === 100
                                ? 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{course.isCompleted || course.progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* List View Layout */
                      <>
                        <div className="w-full sm:w-32 h-24 bg-slate-900 rounded-xl overflow-hidden shrink-0 relative">
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
                          <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">by {course.instructor || 'Instructor'}</p>
                          
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)}`}
                                style={{ width: `${course.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-white min-w-[2.5rem]">{course.progress || 0}%</span>
                          </div>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto">
                          <button 
                            onClick={() => handleStartLearning(course.id)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
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
          <div className="space-y-6">

            {/* Resume Last Course Jump Card */}
            {lastAccessedCourse && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Continue Where You Left Off
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-white line-clamp-1 mb-1">{lastAccessedCourse.title}</h4>
                <p className="text-slate-300 text-xs mb-4">Instructor: {lastAccessedCourse.instructor || 'Instructor'}</p>

                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Course Progress</span>
                    <span className="font-bold text-blue-400">{lastAccessedCourse.progress || 0}%</span>
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
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-current" />
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
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Learning Milestones
              </h3>
              
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Course Completion</p>
                      <p className="text-slate-400 text-[11px]">Goal: 5 Courses</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {Math.min(stats.completedCourses || 0, 5)} / 5
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Study Target</p>
                      <p className="text-slate-400 text-[11px]">Goal: 30 Hours</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {Math.min(stats.totalHours || 12, 30)} / 30h
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Weekly Streak</p>
                      <p className="text-slate-400 text-[11px]">Goal: 7 Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
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
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-md text-white font-medium text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Compass className="w-4 h-4" />
                    <span>Explore New Courses</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigate('/student/account')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-2xl hover:bg-slate-800 transition-all duration-200 text-slate-300 hover:text-white font-medium text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Account & Security Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-slate-500 group-hover:text-white" />
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