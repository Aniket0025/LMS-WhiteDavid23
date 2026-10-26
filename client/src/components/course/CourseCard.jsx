import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, BookOpen, CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const isEnrolled = isLoggedIn && user && user.enrolledCourse && user.enrolledCourse.some(c => {
    const id = c._id || c;
    return course._id && id.toString() === course._id.toString();
  });

  const handleCourseClick = () => {
    if (isEnrolled) {
      navigate(`/course/${course._id}/learn`);
      return;
    }
    navigate(`/course/${course._id}`);
  };

  const ratingsList = course.ratings || [];
  const avgRating = ratingsList.length > 0 
    ? (ratingsList.reduce((acc, r) => acc + (r.rating || 0), 0) / ratingsList.length).toFixed(1)
    : (course.rating && course.rating !== '4.0' ? course.rating : null);

  const displayDuration = course.totalDuration ? `${course.totalDuration}h` : (course.duration || 'Self-paced');
  const courseCategory = course.category || (course.title?.toLowerCase().includes('devops') ? 'Cloud & DevOps' : 'Machine Learning & AI');
  const educatorName = course.educator?.name || course.instructor || 'Lead Instructor';

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
      }}
      className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 hover:border-blue-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer group h-full flex flex-col"
      onClick={handleCourseClick}
    >
      {/* Course Thumbnail */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden"> 
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-900/60 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-blue-400/40" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
        
        {/* Course Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-semibold border border-white/10 tracking-wide">
            {courseCategory}
          </span>
        </div>

        {/* Rating or Featured Badge */}
        <div className="absolute top-3 right-3">
          {avgRating ? (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-xs border border-yellow-500/40">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span className="font-semibold">{avgRating}</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide shadow-md">
              Featured
            </div>
          )}
        </div>

        {/* Enrolled Badge */}
        {isEnrolled && (
          <div className="absolute bottom-3 right-3">
            <div className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1 border border-emerald-400/40">
              <CheckCircle2 className="w-3 h-3" />
              Enrolled
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Educator row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/40 text-[10px] font-bold text-blue-300 flex items-center justify-center">
              {educatorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">
              {educatorName}
            </span>
            <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
          </div>

          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
            {course.title}
          </h3>
          
          <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div>
          {/* Course Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 py-2.5 border-t border-slate-800/80 mb-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{displayDuration}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{course.chapters?.length || 0} chapters</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{course.enrolledStudents?.length || 0}</span>
            </div>
          </div>

          {/* Pricing & Action */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Total Course Fee</span>
              <span className="text-lg font-black text-white">
                ₹{Number(course.price || 0).toLocaleString('en-IN')}
              </span>
            </div>
            
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                handleCourseClick();
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isEnrolled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25'
              }`}
            >
              {isEnrolled ? (
                <>
                  <Play className="w-3 h-3" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
