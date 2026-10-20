import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  FileText,
  Lock,
  Clock,
  BookOpen,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  ImageIcon,
  ExternalLink,
  Download,
  Maximize2,
  MessageSquare,
  HelpCircle,
  Info,
  Sparkles,
  Share2,
  Check,
  RotateCcw,
  FileCheck,
  ShieldAlert,
  ListVideo
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCourseById } from '../../Api/courseApi';
import { checkCoursePurchase, getCourseProgress, updateCourseProgress } from '../../Api/userApi';
import { getLectureWithAccess } from '../../Api/lectureApi';
import { useAuth } from '../../context/AuthContext';
import OpenVideoPlayer from './OpenVideoPlayer';
import ProtectedPdfViewer from './ProtectedPdfViewer';
import './CourseLearn.css';

const CourseLearn = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const containerRef = useRef(null);
  const mainContentRef = useRef(null);

  // Build the server-side proxy URL for a document lecture
  const getDocumentProxyUrl = (lectureId) => {
    if (!lectureId) return '';
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const token = localStorage.getItem('token');
    return `${backendUrl}/api/lecture/document/${lectureId}?token=${encodeURIComponent(token || '')}`;
  };

  // Convert MEGA Drive URL to embed player link
  const getMegaEmbedUrl = (url) => {
    if (!url) return null;
    // Format 1: Already an embed URL: https://mega.nz/embed/... or mega.io/embed/...
    if (url.includes('mega.nz/embed/') || url.includes('mega.io/embed/')) {
      return url;
    }
    // Format 2: Standard file share link: https://mega.nz/file/<id>#<key>
    const match = url.match(/^https?:\/\/(?:www\.)?mega\.(?:nz|io)\/file\/([a-zA-Z0-9_-]+#.+)$/);
    if (match) {
      return `https://mega.nz/embed/${match[1]}`;
    }
    // Format 3: Legacy link format: https://mega.nz/#!<id>!<key>
    const legacyMatch = url.match(/^https?:\/\/(?:www\.)?mega\.(?:nz|io)\/#!(?:file\/)?([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/);
    if (legacyMatch) {
      return `https://mega.nz/embed/${legacyMatch[1]}#${legacyMatch[2]}`;
    }
    // Generic fallback for any other mega link containing /file/
    if (url.includes('mega.nz/file/') || url.includes('mega.io/file/')) {
      return url.replace('/file/', '/embed/');
    }
    return null;
  };

  // YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    return null;
  };

  // Detect if video should be iframe embed (MEGA Drive, YouTube, etc.)
  const isEmbedVideo = (url) => {
    if (!url) return false;
    return (
      url.includes('mega.nz') ||
      url.includes('mega.io') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be')
    );
  };

  const getVideoEmbedSrc = (url) => {
    if (!url) return '';
    const yt = getYouTubeEmbedUrl(url);
    if (yt) return yt;
    const mega = getMegaEmbedUrl(url);
    if (mega) return mega;
    return url;
  };

  const getViewerSrc = (url, mode, lectureId) => {
    if (!url) return '';
    let srcUrl = url;
    if (lectureId) {
      srcUrl = getDocumentProxyUrl(lectureId);
    }
    // Append parameters to hide toolbar and auto-fit PDF page width (view=FitH) for big mobile display
    return srcUrl.includes('#') ? srcUrl : `${srcUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  };

  const handleDocumentDownload = (lectureId, fileName) => {
    toast.error('Downloading course resources is restricted for content protection.');
  };

  // Course and access state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  // Learning position state
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [currentVideoData, setCurrentVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Accordion expanded state for chapters
  const [expandedChapters, setExpandedChapters] = useState(new Set([0]));

  // Active tab below video ('curriculum', 'overview', 'notes', 'resources', 'discussion')
  const [activeTab, setActiveTab] = useState(window.innerWidth < 768 ? 'curriculum' : 'overview');

  // Handle lecture selection with smooth scroll & mobile drawer close
  const handleSelectLecture = (chapterIndex, lectureIndex) => {
    setCurrentChapter(chapterIndex);
    setCurrentLecture(lectureIndex);
    if (isMobile) {
      setSidebarOpen(false);
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Layout UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSize, setVideoSize] = useState('large'); // 'normal', 'large', 'theater'
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savedNotesStatus, setSavedNotesStatus] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load saved notes when lecture changes
  useEffect(() => {
    if (courseId && currentVideoData?._id) {
      const saved = localStorage.getItem(`lms_notes_${courseId}_${currentVideoData._id}`);
      setNotesText(saved || '');
    }
  }, [courseId, currentVideoData]);

  const handleSaveNotes = () => {
    if (!courseId || !currentVideoData?._id) return;
    localStorage.setItem(`lms_notes_${courseId}_${currentVideoData._id}`, notesText);
    setSavedNotesStatus('Saved!');
    setTimeout(() => setSavedNotesStatus(''), 2500);
  };

  const handleCopyNotes = () => {
    if (!notesText.trim()) return;
    navigator.clipboard.writeText(notesText);
    toast.success('Lecture notes copied to clipboard!');
  };

  // Toggle chapter collapse/expand
  const toggleChapter = (chapterIndex) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterIndex)) {
        next.delete(chapterIndex);
      } else {
        next.add(chapterIndex);
      }
      return next;
    });
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  }, []);

  // Listen to fullscreenchange event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Verify Course Access
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      try {
        const response = await checkCoursePurchase(courseId);
        if (response.success && response.isEnrolled) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setError('You do not have access to this course.');
          window.location.href = "https://whitedavid23.org/courses";
        }
      } catch (err) {
        console.error('Access check failed:', err);
        setHasAccess(false);
        setError('Failed to verify course access.');
      } finally {
        setAccessLoading(false);
      }
    };

    checkAccess();
  }, [courseId, isLoggedIn, authLoading, navigate]);

  // Fetch Course Data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!hasAccess) return;

      try {
        setLoading(true);
        const response = await getCourseById(courseId);
        if (response.success && response.course) {
          setCourse(response.course);
          // Expand current chapter by default
          setExpandedChapters(new Set([0]));
        } else {
          setError('Course not found or access denied');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, hasAccess]);

  // Load User Progress
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!hasAccess || !courseId) return;

      try {
        const response = await getCourseProgress(courseId);
        if (response.success && response.progress) {
          const completedSet = new Set();
          if (response.progress.completedLectures && Array.isArray(response.progress.completedLectures)) {
            response.progress.completedLectures.forEach(item => {
              if (item.chapter !== undefined && item.lecture !== undefined) {
                completedSet.add(`${item.chapter}-${item.lecture}`);
              }
            });
          }
          setCompletedLectures(completedSet);

          if (response.progress.lastPosition) {
            const { chapter, lecture } = response.progress.lastPosition;
            if (chapter !== undefined && lecture !== undefined) {
              setCurrentChapter(chapter);
              setCurrentLecture(lecture);
              setExpandedChapters(prev => new Set([...prev, chapter]));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user progress:', err);
      }
    };

    loadUserProgress();
  }, [courseId, hasAccess]);

  // Load current lecture detailed access data
  useEffect(() => {
    const loadCurrentLecture = async () => {
      if (!course?.chapters?.[currentChapter]?.chapterContent?.[currentLecture]) {
        setCurrentVideoData(null);
        return;
      }

      const lecture = course.chapters[currentChapter].chapterContent[currentLecture];
      if (!lecture) return;

      // Set lecture data immediately from populated course object
      setCurrentVideoData(lecture);

      if (!lecture._id) return;

      try {
        setVideoLoading(true);
        const response = await getLectureWithAccess(courseId, lecture._id);
        if (response.success && response.lecture) {
          setCurrentVideoData(response.lecture);
        }
      } catch (err) {
        console.error('Error loading lecture:', err);
      } finally {
        setVideoLoading(false);
      }
    };

    loadCurrentLecture();
  }, [course, currentChapter, currentLecture, courseId]);

  // Navigation helpers
  const goToPreviousLecture = useCallback(() => {
    if (currentLecture > 0) {
      setCurrentLecture(currentLecture - 1);
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentChapter > 0 && course?.chapters) {
      const prevChapter = course.chapters[currentChapter - 1];
      setCurrentChapter(currentChapter - 1);
      setCurrentLecture((prevChapter.chapterContent?.length || 1) - 1);
      setExpandedChapters(prev => new Set([...prev, currentChapter - 1]));
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentLecture, currentChapter, course?.chapters]);

  const goToNextLecture = useCallback(() => {
    if (!course?.chapters) return;
    const currentChapterLectures = course.chapters[currentChapter]?.chapterContent || [];
    if (currentLecture + 1 < currentChapterLectures.length) {
      setCurrentLecture(currentLecture + 1);
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentChapter + 1 < course.chapters.length) {
      setCurrentChapter(currentChapter + 1);
      setCurrentLecture(0);
      setExpandedChapters(prev => new Set([...prev, currentChapter + 1]));
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentLecture, currentChapter, course?.chapters]);

  const canGoPrevious = useCallback(() => {
    return currentChapter > 0 || currentLecture > 0;
  }, [currentChapter, currentLecture]);

  const canGoNext = useCallback(() => {
    if (!course?.chapters) return false;
    const currentChapterLectures = course.chapters[currentChapter]?.chapterContent || [];
    return (currentLecture + 1 < currentChapterLectures.length) || (currentChapter + 1 < course.chapters.length);
  }, [currentLecture, currentChapter, course?.chapters]);

  // Mark completion
  const markLectureComplete = async (chapterIndex, lectureIndex) => {
    const lectureKey = `${chapterIndex}-${lectureIndex}`;
    if (completedLectures.has(lectureKey)) return;

    const lecture = course?.chapters?.[chapterIndex]?.chapterContent?.[lectureIndex];
    if (!lecture?._id) return;
    const chapterId = course?.chapters?.[chapterIndex]?._id;

    setCompletedLectures(prev => new Set([...prev, lectureKey]));

    try {
      const response = await updateCourseProgress(courseId, {
        lectureId: lecture._id,
        chapterId: chapterId,
        chapter: chapterIndex,
        lecture: lectureIndex
      });
      if (!response.success) throw new Error(response.message);
    } catch (err) {
      console.error('Failed to update progress:', err);
      setCompletedLectures(prev => {
        const next = new Set(prev);
        next.delete(lectureKey);
        return next;
      });
    }
  };

  // Overall progress percentage
  const getProgress = () => {
    if (!course?.chapters) return 0;
    const totalLectures = course.chapters.reduce((total, ch) => total + (ch.chapterContent?.length || 0), 0);
    return totalLectures > 0 ? (completedLectures.size / totalLectures) * 100 : 0;
  };

  const isLectureCompleted = (chapterIndex, lectureIndex) => {
    return completedLectures.has(`${chapterIndex}-${lectureIndex}`);
  };

  const handleShareCourse = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Reusable curriculum accordion list (used in sidebar drawer and curriculum tab)
  const renderCurriculumList = (isTab = false) => {
    return (
      <div className={`space-y-2.5 ${isTab ? 'w-full' : 'p-2'}`}>
        {course?.chapters?.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapters.has(chapterIndex);
          const totalLectures = chapter.chapterContent?.length || 0;
          const chapterCompletedCount = chapter.chapterContent?.filter((_, lIdx) => isLectureCompleted(chapterIndex, lIdx)).length || 0;
          const isChapterComplete = totalLectures > 0 && chapterCompletedCount === totalLectures;

          return (
            <div key={chapter._id || chapterIndex} className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden shadow-sm">
              {/* Chapter Accordion Header */}
              <button
                onClick={() => toggleChapter(chapterIndex)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
              >
                <div className="min-w-0 pr-2 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Chapter {chapterIndex + 1}
                    </span>
                    {isChapterComplete && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {chapter.chapterTitle}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <span>{chapterCompletedCount}/{totalLectures} completed</span>
                    <span>•</span>
                    <span>{totalLectures} {totalLectures === 1 ? 'lesson' : 'lessons'}</span>
                  </div>
                </div>
                <div className="text-slate-400 flex-shrink-0 p-1 rounded-lg bg-slate-800/50">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Lectures Sub-List */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40"
                  >
                    {chapter.chapterContent?.map((lecture, lectureIndex) => {
                      const isCompleted = isLectureCompleted(chapterIndex, lectureIndex);
                      const isCurrent = currentChapter === chapterIndex && currentLecture === lectureIndex;

                      return (
                        <button
                          key={lecture._id || lectureIndex}
                          onClick={() => handleSelectLecture(chapterIndex, lectureIndex)}
                          className={`w-full p-3 sm:p-3.5 text-left transition-all flex items-start space-x-3 group relative min-h-[46px] ${
                            isCurrent 
                              ? 'bg-blue-600/15 text-white lecture-active-accent' 
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          {/* Status / Icon Badge */}
                          <div className="mt-0.5 flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400 fill-emerald-400/20" />
                            ) : isCurrent ? (
                              <div className="relative flex items-center justify-center">
                                <Circle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400 fill-blue-500/20 active-lecture-ring" />
                                <Play className="w-2 h-2 text-blue-400 absolute fill-current" />
                              </div>
                            ) : (
                              <Circle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600 group-hover:text-slate-400" />
                            )}
                          </div>

                          {/* Title & Info */}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm font-medium line-clamp-2 ${isCurrent ? 'text-blue-300 font-semibold' : 'text-slate-200'}`}>
                              {lectureIndex + 1}. {lecture.title}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-400 mt-1">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-slate-500" />
                                {lecture.duration || '5m'}
                              </span>
                              <span>•</span>
                              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 font-medium">
                                {lecture.lectureType || 'video'}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                                  Now Playing
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <Sparkles className="w-6 h-6 text-blue-400 absolute animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Preparing Learning Environment</h3>
        <p className="text-sm text-slate-400">Loading course curriculum & video player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Return to Course Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden ${isFullscreen ? 'bg-black' : ''}`}>
      
      {/* Sleek Top Header Navigation Bar */}
      <header className="h-14 sm:h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between z-30 flex-shrink-0 shadow-md w-full max-w-full overflow-hidden">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden md:flex p-2 rounded-xl transition-all duration-200 shrink-0 ${
              sidebarOpen 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
            }`}
            title={sidebarOpen ? "Hide Curriculum" : "Show Curriculum"}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Back to Course details */}
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all shrink-0 shadow-sm active:scale-95"
            title="Back to Course Details"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-1 text-blue-400" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-slate-800 shrink-0"></div>

          {/* Current Title & Context Breadcrumb */}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-xs font-semibold text-blue-400 uppercase tracking-wider truncate flex items-center gap-1">
              <span>Ch {currentChapter + 1}</span>
              <span>•</span>
              <span>Lec {currentLecture + 1}</span>
            </div>
            <h1 className="text-white font-bold text-xs sm:text-sm md:text-base truncate">
              {currentVideoData?.title || 'Select a lecture'}
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
          
          {/* Mobile Curriculum Drawer Trigger Pill */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-medium transition-all active:scale-95 shrink-0"
            title="Open Course Curriculum"
          >
            <ListVideo className="w-4 h-4 text-blue-400" />
            <span className="hidden xs:inline">Curriculum</span>
            <span className="px-1.5 py-0.5 bg-blue-500/30 rounded-md text-[10px] font-bold text-blue-200 font-mono">
              {Math.round(getProgress())}%
            </span>
          </button>

          {/* Prev/Next Quick Navigation Buttons (Desktop only) */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={goToPreviousLecture}
              disabled={!canGoPrevious()}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoPrevious() ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Previous Lecture"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 px-2 font-mono">
              {currentLecture + 1}/{course?.chapters?.[currentChapter]?.chapterContent?.length || 1}
            </span>
            <button
              onClick={goToNextLecture}
              disabled={!canGoNext()}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoNext() ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Next Lecture"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Share Button (hidden on mobile) */}
          <button
            onClick={handleShareCourse}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:block relative"
            title="Share URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors active:scale-95"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen Mode (F)"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Curriculum Accordion */}
        <motion.aside
          initial={false}
          animate={{
            width: !sidebarOpen ? 0 : isMobile ? '86vw' : sidebarCollapsed ? 64 : 340,
            opacity: !sidebarOpen ? 0 : 1
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`bg-slate-900 border-r border-slate-800/80 flex flex-col overflow-hidden relative z-50 flex-shrink-0 ${
            sidebarOpen && isMobile ? 'fixed inset-y-0 left-0 shadow-2xl max-w-xs sm:max-w-sm' : ''
          }`}
        >
          {sidebarOpen && !sidebarCollapsed && (
            <div className="flex flex-col h-full">
              {/* Sidebar Header & Progress */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-900/95 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ListVideo className="w-4 h-4 text-blue-400" />
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Course Content</h2>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSidebarCollapsed(true)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg hidden md:block"
                      title="Collapse sidebar"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {isMobile && (
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center bg-slate-800/50"
                        title="Close drawer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Percentage Badge */}
                <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Overall Progress
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">{Math.round(getProgress())}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress()}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full rounded-full shadow-sm shadow-emerald-500/50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">
                    {completedLectures.size} of {course?.chapters?.reduce((t, c) => t + (c.chapterContent?.length || 0), 0)} completed
                  </p>
                </div>
              </div>

              {/* Chapters & Lectures Accordion List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {renderCurriculumList(false)}
              </div>
            </div>
          )}

          {/* Collapsed Sidebar View (Icon Bar) */}
          {sidebarOpen && sidebarCollapsed && (
            <div className="flex flex-col items-center py-4 space-y-6 h-full bg-slate-900">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                title="Expand Curriculum"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {Math.round(getProgress())}%
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar px-2">
                {course?.chapters?.map((ch, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => {
                      setCurrentChapter(cIdx);
                      setCurrentLecture(0);
                      setSidebarCollapsed(false);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      currentChapter === cIdx ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={`Chapter ${cIdx + 1}: ${ch.chapterTitle}`}
                  >
                    {cIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.aside>

        {/* Right Main Content Area (Player + Tabs) */}
        <main ref={mainContentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-slate-950">
          
          {/* Media / Player Box */}
          <div className="w-full bg-black relative flex flex-col items-center justify-center">
            {videoLoading ? (
              <div className="w-full aspect-video max-h-[70vh] flex items-center justify-center bg-slate-950">
                <div className="text-center text-slate-400">
                  <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs">Loading lecture media...</p>
                </div>
              </div>
            ) : currentVideoData ? (
              <div className="w-full max-w-6xl mx-auto">
                {/* Content Renderers */}
                {currentVideoData.lectureType === 'image' ? (
                  /* Image Lightbox View */
                  <div className="w-full aspect-video max-h-[70vh] flex items-center justify-center p-4 bg-slate-950 relative">
                    <img
                      src={currentVideoData.videoUrl}
                      alt={currentVideoData.title}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800"
                    />
                  </div>
                ) : currentVideoData.lectureType === 'file' ? (
                  /* Protected PDF Document View — Read-only Canvas, Zero Download */
                  <div className="w-full bg-slate-950 border-b border-slate-800 flex flex-col">
                    <ProtectedPdfViewer
                      url={getDocumentProxyUrl(currentVideoData._id)}
                      title={currentVideoData.title}
                      user={user}
                    />
                  </div>
                ) : (
                  /* OpenPlayerJS Video Player */
                  <OpenVideoPlayer
                    src={currentVideoData.videoUrl}
                    poster={course?.thumbnail}
                    title={currentVideoData.title}
                    onEnded={() => markLectureComplete(currentChapter, currentLecture)}
                    user={user}
                    isEmbed={isEmbedVideo(currentVideoData.videoUrl)}
                    embedSrc={getVideoEmbedSrc(currentVideoData.videoUrl)}
                  />
                )}
              </div>
            ) : (
              <div className="w-full aspect-video max-h-[60vh] flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
                <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-white font-semibold mb-1">Select a lecture to begin</h3>
                <p className="text-xs text-slate-400">Choose any topic from the curriculum sidebar on the left or tabs below.</p>
              </div>
            )}
          </div>

          {/* Sub-Player Action Bar & Navigation */}
          <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 py-2.5 shadow-md w-full">
            {/* Mobile View: 3-Button thumb-accessible action bar */}
            <div className="flex sm:hidden items-center justify-between gap-2 w-full">
              <button
                onClick={goToPreviousLecture}
                disabled={!canGoPrevious()}
                className={`flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1 transition-all active:scale-95 ${
                  canGoPrevious() 
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {!isLectureCompleted(currentChapter, currentLecture) ? (
                <button
                  onClick={() => markLectureComplete(currentChapter, currentLecture)}
                  className="flex-[1.4] py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>
              ) : (
                <div className="flex-[1.4] py-2.5 px-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Completed</span>
                </div>
              )}

              <button
                onClick={goToNextLecture}
                disabled={!canGoNext()}
                className={`flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1 transition-all active:scale-95 ${
                  canGoNext() 
                    ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20' 
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop / Tablet View: Spacious Action Bar */}
            <div className="hidden sm:flex items-center justify-between gap-3 w-full">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Lecture Action:</span>
                {!isLectureCompleted(currentChapter, currentLecture) ? (
                  <button
                    onClick={() => markLectureComplete(currentChapter, currentLecture)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    <Circle className="w-4 h-4" />
                    <span>Mark as Complete</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-medium text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Completed</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={goToPreviousLecture}
                  disabled={!canGoPrevious()}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 ${
                    canGoPrevious() 
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' 
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={goToNextLecture}
                  disabled={!canGoNext()}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 ${
                    canGoNext() 
                      ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20' 
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Details & Interactive Tabs Area Below Player */}
          <div className="p-3.5 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-5 sm:space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 border-b border-slate-800/80 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar max-w-full whitespace-nowrap pb-0.5">
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 transition-colors flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap px-2 sm:px-1 ${
                  activeTab === 'curriculum' ? 'text-blue-400 tab-active-indicator' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListVideo className="w-4 h-4" />
                <span>Curriculum</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {completedLectures.size}/{course?.chapters?.reduce((t, c) => t + (c.chapterContent?.length || 0), 0) || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 transition-colors flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap px-2 sm:px-1 ${
                  activeTab === 'overview' ? 'text-blue-400 tab-active-indicator' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 transition-colors flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap px-2 sm:px-1 ${
                  activeTab === 'notes' ? 'text-blue-400 tab-active-indicator' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Personal Notes</span>
                {notesText.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 transition-colors flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap px-2 sm:px-1 ${
                  activeTab === 'resources' ? 'text-blue-400 tab-active-indicator' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Resources</span>
              </button>

              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-3 transition-colors flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap px-2 sm:px-1 ${
                  activeTab === 'discussion' ? 'text-blue-400 tab-active-indicator' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Q&A Discussion</span>
              </button>
            </div>

            {/* Tab Content Areas */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  {/* Mobile Curriculum Progress Card */}
                  <div className="bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-slate-800/70 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Curriculum Progress
                      </span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{Math.round(getProgress())}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full rounded-full shadow-sm shadow-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{completedLectures.size} of {course?.chapters?.reduce((t, c) => t + (c.chapterContent?.length || 0), 0)} completed</span>
                      <span>{course?.chapters?.length || 0} Chapters</span>
                    </div>
                  </div>

                  {/* Render the full curriculum list right inside the tab */}
                  {renderCurriculumList(true)}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{currentVideoData?.title || course?.title}</h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {currentVideoData?.description || course?.description || 'No detailed description available for this lecture.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-800/60 text-xs">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                      <span className="text-slate-400 block mb-1">Instructor</span>
                      <span className="font-semibold text-white text-sm">{course?.educator?.name || course?.instructor || 'Course Instructor'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                      <span className="text-slate-400 block mb-1">Course Level</span>
                      <span className="font-semibold text-white text-sm">{course?.level || 'All Levels'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                      <span className="text-slate-400 block mb-1">Curriculum</span>
                      <span className="font-semibold text-white text-sm">
                        {course?.chapters?.length || 0} Chapters • {course?.chapters?.reduce((t, c) => t + (c.chapterContent?.length || 0), 0)} Lectures
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white">Lecture Notes</h3>
                      <p className="text-xs text-slate-400">Notes are saved automatically in your browser per lecture.</p>
                    </div>
                    {savedNotesStatus && (
                      <span className="text-xs font-semibold text-emerald-400 animate-pulse bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {savedNotesStatus}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={7}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm leading-relaxed"
                    placeholder="Take notes here while learning..."
                  />

                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2.5">
                    <button
                      onClick={handleSaveNotes}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Save Notes</span>
                    </button>

                    <button
                      onClick={handleCopyNotes}
                      disabled={!notesText.trim()}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Copy Notes</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-white">Course Study Resources</h3>
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Protected View</span>
                    </span>
                  </div>
                  {currentVideoData?.lectureType === 'file' ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <FileText className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{currentVideoData.title}.pdf</p>
                          <p className="text-xs text-slate-400">PDF Document • Protected Viewer</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewDocUrl(currentVideoData.videoUrl)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95 shrink-0"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>View Document Online</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/60 p-4">
                      <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-300 font-medium">No external document attachments for this lecture.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Direct file downloads are restricted for course content protection.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="space-y-4 text-center py-6">
                  <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-white">Course Q&A Community</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Have questions about this lecture? Discussion forum features will be enabled here soon!
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Fullscreen Sub-Window Document Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6">
          <div className="bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-2xl w-full h-full sm:h-[92vh] max-w-6xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {currentVideoData?.title || 'Document Viewer'}
                </h3>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] font-semibold flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Protected View</span>
                </div>
                <button
                  onClick={() => setPreviewDocUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col min-h-0" onContextMenu={(e) => e.preventDefault()}>
              <ProtectedPdfViewer
                url={getDocumentProxyUrl(currentVideoData?._id) || previewDocUrl}
                title={currentVideoData?.title}
                user={user}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseLearn;
