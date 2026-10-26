
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { 
  Play,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Search,
  ChevronDown,
  Star,
  Clock,
  Globe,
  Zap,
  Target,
  Trophy,
  Sparkles
} from 'lucide-react';

import { getAllCourses } from '../../Api/courseApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Hero = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const controls = useAnimation();

  const handleCourseClick = (course) => {
    if (!course?._id) return;
    const isEnrolled = isLoggedIn && user && user.enrolledCourse && user.enrolledCourse.some(c => {
      const id = c._id || c;
      return id.toString() === course._id.toString();
    });
    if (isEnrolled) {
      navigate(`/course/${course._id}/learn`);
      return;
    }
    navigate(`/course/${course._id}`);
  };

  // Real statistics derived from API data
  const [heroStats, setHeroStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    averageRating: null,
    totalChapters: 0,
  });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [typewriterDisplay, setTypewriterDisplay] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Typewriter effect matching the platform tracks
  const typewriterTexts = [
    "Cloud & DevOps",
    "Machine Learning & AI",
    "Modern System Design",
    "Docker & Kubernetes",
    "Full-Stack Engineering"
  ];

  // Fetch real data on component mount
  useEffect(() => {
    fetchHeroData();
    startTypewriterEffect();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await getAllCourses();
      if (response?.success && response.courses) {
        const courses = response.courses;

        // Calculate real stats from database courses
        const totalCourses = courses.length;

        // Unique enrolled students across all courses
        const studentSet = new Set();
        courses.forEach(c => {
          (c.enrolledStudents || []).forEach(s => {
            const sId = typeof s === 'object' ? s._id : s;
            if (sId) studentSet.add(sId.toString());
          });
        });

        // Unique educators
        const instructorSet = new Set();
        courses.forEach(c => {
          const eId = c.educator?._id || (typeof c.educator === 'string' ? c.educator : null);
          if (eId) instructorSet.add(eId.toString());
        });

        // Total chapters
        const totalChapters = courses.reduce((acc, c) => acc + (c.chapters?.length || 0), 0);

        // Real ratings
        let totalRatingSum = 0;
        let ratingCount = 0;
        courses.forEach(c => {
          (c.ratings || []).forEach(r => {
            if (r?.rating) {
              totalRatingSum += r.rating;
              ratingCount++;
            }
          });
        });
        const avgRating = ratingCount > 0 ? (totalRatingSum / ratingCount).toFixed(1) : null;

        setHeroStats({
          totalCourses,
          totalStudents: studentSet.size,
          totalInstructors: Math.max(instructorSet.size, totalCourses > 0 ? 1 : 0),
          averageRating: avgRating,
          totalChapters,
        });

        // Populate featured courses with the real courses
        setFeaturedCourses(courses.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      setHeroStats({
        totalCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        averageRating: null,
        totalChapters: 0,
      });
      setFeaturedCourses([]);
    }
  };

  const startTypewriterEffect = () => {
    let currentIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    
    const typeWriter = () => {
      const currentText = typewriterTexts[currentIndex];
      
      if (isDeleting) {
        setTypewriterDisplay(currentText.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        
        if (currentCharIndex === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % typewriterTexts.length;
          setTimeout(typeWriter, 800);
          return;
        }
      } else {
        setTypewriterDisplay(currentText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        
        if (currentCharIndex === currentText.length) {
          isDeleting = true;
          setTimeout(typeWriter, 3000);
          return;
        }
      }
      
      setTimeout(typeWriter, isDeleting ? 80 : 130);
    };
    
    typeWriter();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/course');
    }
  };

  const handleGetStarted = () => {
    navigate('/course');
  };
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const typingVariants = {
    hidden: { width: 0 },
    visible: {
      width: "auto",
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-[#060c1d] to-slate-950 overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Hero Section */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 max-w-7xl w-full items-center z-10">
        <motion.div 
          className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left order-2 lg:order-1"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {/* Main Headline with Zero-Jank Fixed-Height Typewriter (Responsive for all screen sizes) */}
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[46px] 2xl:text-5xl font-black tracking-tight leading-[1.15]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-white block mb-1.5 sm:mb-2 font-black">
              Master New Skills in
            </span>
            <div className="h-[1.35em] flex items-center overflow-hidden justify-center lg:justify-start">
              <span className="text-[20px] sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] 2xl:text-[46px] bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap inline-flex items-center">
                {typewriterDisplay}
                <span className="inline-block w-[2.5px] sm:w-[3px] h-[0.85em] bg-cyan-400 ml-1.5 rounded-full animate-pulse shrink-0" />
              </span>
            </div>
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Industry-grade masterclasses taught by top practitioners. Dive straight into practical DevOps, 
            Cloud Infrastructure, Machine Learning, and software engineering with real code and hands-on projects.
          </motion.p>

          {/* Stats Section - Driven by Real Database Data */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 sm:p-3.5 hover:border-blue-500/30 transition-all duration-300 group text-center lg:text-left">
              <BookOpen className="w-5 h-5 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0" />
              <div className="text-lg sm:text-xl font-black text-white">
                {heroStats.totalCourses > 0 ? heroStats.totalCourses : '2'}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {heroStats.totalCourses === 1 ? 'Masterclass' : 'Masterclasses'}
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 sm:p-3.5 hover:border-emerald-500/30 transition-all duration-300 group text-center lg:text-left">
              <Users className="w-5 h-5 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0" />
              <div className="text-lg sm:text-xl font-black text-white">
                {heroStats.totalStudents > 0 ? `${heroStats.totalStudents}` : 'Active'}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {heroStats.totalStudents > 0 ? 'Enrolled Learners' : 'Learner Community'}
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 sm:p-3.5 hover:border-amber-500/30 transition-all duration-300 group text-center lg:text-left">
              <Award className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0" />
              <div className="text-lg sm:text-xl font-black text-white">
                {heroStats.totalInstructors > 0 ? heroStats.totalInstructors : 1}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {heroStats.totalInstructors > 1 ? 'Verified Mentors' : 'Lead Mentor'}
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 sm:p-3.5 hover:border-purple-500/30 transition-all duration-300 group text-center lg:text-left">
              <TrendingUp className="w-5 h-5 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0" />
              <div className="text-lg sm:text-xl font-black text-white">
                {heroStats.averageRating ? `${heroStats.averageRating} ★` : (heroStats.totalChapters > 0 ? `${heroStats.totalChapters} ${heroStats.totalChapters === 1 ? 'Chapter' : 'Chapters'}` : '100% Practical')}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {heroStats.averageRating ? 'Average Rating' : 'Structured Syllabus'}
              </div>
            </div>
          </motion.div>

          {/* Search Bar with Quick Tag Pills */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <form 
              className="max-w-xl mx-auto lg:mx-0 w-full"
              onSubmit={handleSearch}
            >
              <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-2xl p-1.5 hover:border-blue-500/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300 shadow-xl shadow-black/40">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-3 sm:ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search DevOps, ML, Cloud tracks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Popular Tracks:</span>
              {['DevOps', 'ML', 'Cloud', 'Docker', 'All Masterclasses'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => tag === 'All Masterclasses' ? navigate('/course') : navigate(`/search?query=${encodeURIComponent(tag === 'Docker' ? 'Docker' : tag)}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.button 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 transition-all duration-300 w-full sm:w-auto"
              onClick={handleGetStarted}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Explore Masterclasses</span>
            </motion.button>
            
            <motion.button 
              className="flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-white px-6 sm:px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 w-full sm:w-auto"
              onClick={() => navigate('/about')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>About Platform</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Interactive Masterclass Spotlight (Visible on all devices!) */}
        {featuredCourses.length > 0 && (
          <motion.div 
            className="lg:col-span-5 relative flex flex-col items-center justify-center order-1 lg:order-2 pt-2 lg:pt-0 w-full max-w-md xl:max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Background ambient glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

            {/* Floating Tech Skill Badges */}
            <motion.div 
              className="hidden sm:flex absolute -top-3.5 right-4 z-20 items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 border border-blue-500/40 text-[11px] font-semibold text-blue-300 shadow-xl backdrop-blur-md"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>🐳 Docker & K8s</span>
            </motion.div>

            <motion.div 
              className="hidden sm:flex absolute -bottom-2.5 left-4 z-20 items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-xl backdrop-blur-md"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>🧠 Neural Networks & ML</span>
            </motion.div>

            {/* Primary Featured Course Card */}
            {(() => {
              const primaryCourse = featuredCourses[0];
              const category = primaryCourse.category || (primaryCourse.title?.toLowerCase().includes('devops') ? 'Cloud & DevOps' : 'Machine Learning & AI');
              const duration = primaryCourse.totalDuration ? `${primaryCourse.totalDuration}h` : (primaryCourse.duration || 'Self-paced');
              const ratingsList = primaryCourse.ratings || [];
              const avgRating = ratingsList.length > 0 
                ? (ratingsList.reduce((acc, r) => acc + (r.rating || 0), 0) / ratingsList.length).toFixed(1)
                : null;
              const chCount = primaryCourse.chapters?.length || 0;
              const chapterStr = `${chCount} ${chCount === 1 ? 'chapter' : 'chapters'}`;

              return (
                <div 
                  onClick={() => handleCourseClick(primaryCourse)}
                  className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/60 transition-all duration-300 shadow-2xl overflow-hidden cursor-pointer group"
                >
                  {/* Spotlight Top Bar */}
                  <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-semibold text-slate-300">Featured Masterclass</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {category}
                    </span>
                  </div>

                  {/* Thumbnail Banner */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
                    {primaryCourse.thumbnail ? (
                      <img 
                        src={primaryCourse.thumbnail} 
                        alt={primaryCourse.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-400/40">
                        <BookOpen className="w-14 h-14" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{primaryCourse.enrolledStudents?.length || 0} Learners</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-xs font-bold shadow-md">
                        ₹{primaryCourse.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/40 text-[10px] font-bold text-blue-300 flex items-center justify-center">
                          {(primaryCourse.educator?.name || 'A').charAt(0)}
                        </div>
                        <span>by {primaryCourse.educator?.name || 'Lead Mentor'}</span>
                      </div>
                      {avgRating ? (
                        <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{avgRating}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Verified Curriculum
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                      {primaryCourse.title}
                    </h4>

                    <p className="text-slate-400 text-xs mb-4 line-clamp-2">
                      {primaryCourse.description}
                    </p>

                    {/* Stats bar & Quick View */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" /> {duration}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {chapterStr}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                        Explore Syllabus <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Secondary Course Sneak-Peek (If second course exists) */}
            {featuredCourses[1] && (
              <div 
                onClick={() => handleCourseClick(featuredCourses[1])}
                className="w-full mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {featuredCourses[1].thumbnail ? (
                      <img src={featuredCourses[1].thumbnail} alt={featuredCourses[1].title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">Also Available</span>
                    <h5 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {featuredCourses[1].title}
                    </h5>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-white block">₹{featuredCourses[1].price?.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400">View Course →</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <motion.div 
          className="absolute w-72 h-72 bg-blue-500/5 rounded-full top-[20%] left-[10%] blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute w-48 h-48 bg-purple-500/5 rounded-full bottom-[20%] right-[15%] blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.05, 0.15]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-slate-500/3 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-3xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.03, 0.1, 0.03]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-slate-400 text-xs sm:text-sm flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="hidden sm:inline">Explore More</span>
        <span className="sm:hidden">More</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Hero
