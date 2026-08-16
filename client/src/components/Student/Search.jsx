import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Clock,
  Star,
  Users,
  BookOpen,
  X,
  Loader,
  Filter,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

import { searchCourses, getAllCourses } from '../../Api/courseApi.js';
import { useAuth } from '../../context/AuthContext';

const POPULAR_SEARCHES = [
  'All Courses',
  'JavaScript',
  'Python',
  'React',
  'Data Science',
  'UI/UX Design',
  'Machine Learning',
  'Web Development'
];

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [searchResults, setSearchResults] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Load courses on initial mount or when query search param changes
  const executeSearch = async (term, cat = selectedCategory) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (!term.trim() || term === 'All Courses') {
        response = await searchCourses('');
      } else {
        response = await searchCourses(term.trim(), { category: cat !== 'All' ? cat : undefined });
      }

      let fetchedCourses = response?.data || response?.courses || [];
      if (!Array.isArray(fetchedCourses) && response?.success && Array.isArray(response.data)) {
        fetchedCourses = response.data;
      }

      setSearchResults(fetchedCourses);
      if (!term.trim()) {
        setAllCourses(fetchedCourses);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search courses');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('query') || searchParams.get('q') || '';
    setSearchTerm(q);
    executeSearch(q);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ query: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
    executeSearch(searchTerm);
  };

  const handlePopularSearch = (tag) => {
    if (tag === 'All Courses') {
      setSearchTerm('');
      setSearchParams({});
      executeSearch('');
    } else {
      setSearchTerm(tag);
      setSearchParams({ query: tag });
      executeSearch(tag);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
    executeSearch('');
  };

  // Sort & Filter search results
  const filteredAndSortedCourses = searchResults
    .filter(course => {
      if (selectedCategory === 'All') return true;
      return course.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
      }
      if (sortBy === 'rating') {
        const getAvg = (ratings) => ratings && ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        return getAvg(b.ratings) - getAvg(a.ratings);
      }
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      // recent default
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 pt-24 pb-20 text-slate-100">
      {/* Dynamic Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        
        {/* Header Hero */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Course Library</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Find Your Next <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Learning Goal</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover thousands of video courses designed by expert instructors to build real-world skills
          </p>
        </motion.div>

        {/* Main Search Input Form */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500/80 transition-all duration-300">
              <div className="relative flex-1 flex items-center">
                <SearchIcon className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses, skills, technologies (e.g. React, Python...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* Popular Searches Pills */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-10 text-center"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Popular Topics</span>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.map((tag) => {
              const isActive = (tag === 'All Courses' && !searchTerm) || (searchTerm.toLowerCase() === tag.toLowerCase());
              return (
                <button
                  key={tag}
                  onClick={() => handlePopularSearch(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Filter & Sort Bar */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-slate-800"
        >
          <div className="flex items-center space-x-2">
            <span className="text-slate-200 font-bold text-sm">
              {filteredAndSortedCourses.length} Course{filteredAndSortedCourses.length !== 1 ? 's' : ''} Available
            </span>
            {searchTerm && (
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium">
                "{searchTerm}"
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Search Results Display Area */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
              <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Searching Catalog</h3>
              <p className="text-xs text-slate-400">Finding matching courses for you...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-md">
              <X className="w-10 h-10 text-red-400 mb-3" />
              <h3 className="text-lg font-bold text-red-400 mb-1">Unable to Load Courses</h3>
              <p className="text-xs text-slate-300 mb-4">{error}</p>
              <button
                onClick={() => executeSearch(searchTerm)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-colors"
              >
                Retry Search
              </button>
            </div>
          </div>
        ) : filteredAndSortedCourses.length > 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredAndSortedCourses.map((course) => (
              <CourseCard key={course._id} course={course} navigate={navigate} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center py-16"
          >
            <div className="inline-flex flex-col items-center p-10 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-lg">
              <BookOpen className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                We couldn't find any published courses matching <span className="text-blue-400 font-semibold">"{searchTerm}"</span>. Try searching for different keywords or explore our popular topics above.
              </p>
              <button
                onClick={handleClearSearch}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Show All Courses
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// CourseCard Component
const CourseCard = ({ course, navigate }) => {
  const { user, isLoggedIn } = useAuth();

  const isEnrolled = user && user.enrolledCourse && user.enrolledCourse.some(c => {
    const id = typeof c === 'object' ? (c._id || c.id) : c;
    return id && course._id && id.toString() === course._id.toString();
  });

  const formatPrice = (price, discount = 0) => {
    if (!price || price === 0) return 'Free';
    const finalPrice = price - (price * discount / 100);
    return `₹${finalPrice.toLocaleString('en-IN')}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '12h 30m';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getAvgRating = (ratings) => {
    if (!ratings || ratings.length === 0) return '4.8';
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleCardClick = () => {
    navigate(`/course/${course._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between transition-all duration-300"
    >
      <div>
        {/* Course Thumbnail Container */}
        <div className="relative h-48 bg-slate-950 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-6 text-center">
              <BookOpen className="w-12 h-12 text-blue-400/40 mb-2" />
            </div>
          )}

          {/* Category Pill Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-blue-400 text-[11px] font-bold rounded-full">
              {course.category || 'General'}
            </span>
          </div>

          {/* Price / Enrolled Badge */}
          <div className="absolute top-3 right-3 z-10">
            {isEnrolled ? (
              <span className="px-3 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
              </span>
            ) : (
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold rounded-full shadow-lg">
                {formatPrice(course.price, course.discount)}
              </span>
            )}
          </div>
        </div>

        {/* Course Details */}
        <div className="p-6">
          <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {course.title}
          </h3>

          <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
            {course.description || 'Master key concepts with structured video modules and hands-on practical exercises.'}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-y border-slate-800 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>{course.enrolledStudents?.length || 0} students</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{getAvgRating(course.ratings)}</span>
            </div>
          </div>

          {/* Educator Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-slate-700">
                {course.educator?.avatar ? (
                  <img src={course.educator.avatar} alt={course.educator.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(course.educator?.name || 'Instructor').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[130px]">
                {course.educator?.name || 'Instructor'}
              </span>
            </div>

            <div className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>{isEnrolled ? 'Learn' : 'Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Search;
