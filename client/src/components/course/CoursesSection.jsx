import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw, Sparkles, BookOpen, Layers } from "lucide-react";
import CourseCard from "./CourseCard";
import { getAllCourses } from "../../Api/courseApi.js";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCourses();
      
      if (response?.success && response.courses) {
        setCourses(response.courses);
        setTimeout(() => setIsVisible(true), 100);
      } else {
        throw new Error(response?.message || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (selectedFilter === "all") return courses;
    if (selectedFilter === "devops") {
      return courses.filter((c) =>
        (c.title + " " + (c.category || "")).toLowerCase().includes("devops")
      );
    }
    if (selectedFilter === "ai") {
      return courses.filter(
        (c) =>
          (c.title + " " + (c.category || "")).toLowerCase().includes("ml") ||
          (c.title + " " + (c.category || "")).toLowerCase().includes("learning") ||
          (c.title + " " + (c.category || "")).toLowerCase().includes("ai")
      );
    }
    return courses;
  }, [courses, selectedFilter]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const courseCardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800/40 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Comprehensive Curriculum</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Featured <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Masterclasses</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real courses with interactive chapter navigation, downloadable guides, and production-tested workflows.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === "all"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Masterclasses ({courses.length})
            </button>
            <button
              onClick={() => setSelectedFilter("devops")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === "devops"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Cloud & DevOps
            </button>
            <button
              onClick={() => setSelectedFilter("ai")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === "ai"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Machine Learning & AI
            </button>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
            >
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 animate-pulse"
                >
                  <div className="bg-slate-800 h-44 rounded-xl mb-4" />
                  <div className="bg-slate-800 h-5 rounded w-3/4 mb-3" />
                  <div className="bg-slate-800 h-4 rounded w-1/2 mb-4" />
                  <div className="bg-slate-800 h-8 rounded w-full" />
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="col-span-full text-center py-12 mb-12"
            >
              <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg mb-2">Failed to load courses</p>
                <p className="text-slate-400 text-xs mb-6">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 mb-12"
            >
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-slate-300 text-base font-semibold">No courses match this track</p>
                <button
                  onClick={() => setSelectedFilter("all")}
                  className="mt-3 text-xs text-blue-400 hover:underline"
                >
                  Reset filter to see all courses
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid grid-cols-1 ${
                filteredCourses.length === 1
                  ? "max-w-md mx-auto"
                  : filteredCourses.length === 2
                  ? "sm:grid-cols-2 max-w-3xl mx-auto"
                  : "sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
              } gap-6 mb-12`}
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  variants={courseCardVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Courses Action */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => navigate("/course")}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 text-sm"
          >
            <span>Browse Full Course Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;
