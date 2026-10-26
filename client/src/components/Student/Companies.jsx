import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileText, 
  BarChart3, 
  Award, 
  Terminal, 
  Cpu, 
  Cloud, 
  CheckCircle2, 
  Circle,
  Sparkles, 
  Layers,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Companies() {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(135);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const playerChapters = [
    { id: 1, title: "1. Container Fundamentals", time: 0, tag: "00:00" },
    { id: 2, title: "2. Building Production Images", time: 35, tag: "00:35" },
    { id: 3, title: "3. Docker Compose & Microservices", time: 75, tag: "01:15" },
  ];

  const activeChapterIndex = playerChapters.reduce((acc, ch, idx) => {
    return currentTime >= ch.time ? idx : acc;
  }, 0);

  // Lazy video autoplay only when scrolled into view to save bandwidth and CPU
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlaybackRate = () => {
    if (!videoRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * (duration || 100);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleChapterClick = (chapterTime) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = chapterTime;
    setCurrentTime(chapterTime);
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const techStack = [
    { name: "Docker", category: "Containerization" },
    { name: "Kubernetes", category: "Orchestration" },
    { name: "Python", category: "Core Language" },
    { name: "PyTorch", category: "Deep Learning" },
    { name: "AWS Cloud", category: "Infrastructure" },
    { name: "Linux / Bash", category: "Systems" },
    { name: "CI/CD Pipelines", category: "Automation" },
    { name: "Git & GitHub", category: "Version Control" },
  ];

  const features = [
    {
      title: "Interactive Video Learning Engine",
      description:
        "Seamless high-definition video streaming with instant chapter jumping, playback speed controls, and timestamp bookmarks.",
      badge: "HD Streaming",
      icon: Play,
      gradient: "from-blue-500 to-indigo-600",
      border: "border-blue-500/30",
    },
    {
      title: "Comprehensive Lecture Notes & PDFs",
      description:
        "Downloadable cheat sheets, lecture slides, and command references available alongside every video chapter.",
      badge: "Curated Notes",
      icon: FileText,
      gradient: "from-purple-500 to-pink-600",
      border: "border-purple-500/30",
    },
    {
      title: "Student Progress & Completion Tracking",
      description:
        "Real-time learning dashboard tracking your watched chapters, completed exercises, and active enrollments.",
      badge: "Live Analytics",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
      border: "border-emerald-500/30",
    },
    {
      title: "Educator Studio & Course Management",
      description:
        "Dedicated instructor portal with chapter organization, video uploading, student roster, and engagement insights.",
      badge: "Instructor Hub",
      icon: Layers,
      gradient: "from-amber-500 to-orange-600",
      border: "border-amber-500/30",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0a1128] via-slate-950 to-slate-950 relative overflow-hidden">
      {/* Subtle ambient grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Industry Skills Ticker Header */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Industry Technologies & Frameworks Covered In Our Tracks
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto mb-16 sm:mb-24">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {tech.name}
              </span>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 hidden sm:inline-block">
                {tech.category}
              </span>
            </div>
          ))}
        </div>

        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Learning Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Designed for Deep Technical <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Mastery</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            whitedavid23 provides an end-to-end learning environment with zero friction — from distraction-free video playback to real-time student analytics.
          </p>
        </div>

        {/* 2-Column Showcase: Interactive Mockup on Left, Feature Cards on Right */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* Left Mockup (Simulating Real Video Experience - prioritized on mobile/tablet) */}
          <div className="lg:col-span-6 xl:col-span-5 relative order-1 lg:order-1 w-full max-w-xl mx-auto lg:max-w-none">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-5 shadow-2xl overflow-hidden">
              {/* Fake Window Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-80 transition-opacity" onClick={togglePlay} title="Play / Pause" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:opacity-80 transition-opacity" onClick={toggleMute} title="Toggle Audio" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleFullscreen} title="Fullscreen" />
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                  <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">whitedavid23-lms-player</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {/* Video Player Preview Window */}
              <div 
                className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between mb-3.5 sm:mb-4 overflow-hidden group select-none cursor-pointer shadow-inner"
                onClick={togglePlay}
              >
                {/* HTML5 Video Element with optimized metadata preloading */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  preload="metadata"
                  muted={isMuted}
                  loop
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="/videos/coding-tutorial.webm" type="video/webm" />
                  <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a8/Fig-Coding-Tutorial.webm/Fig-Coding-Tutorial.webm.480p.vp9.webm" type="video/webm" />
                </video>

                {/* Ambient Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/70 pointer-events-none" />

                {/* Top Badges Overlay */}
                <div className="relative z-10 flex items-center justify-between p-2.5 sm:p-3 gap-1.5">
                  <span className="text-[10px] sm:text-xs font-semibold text-white px-2 sm:px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                    <span className="truncate">DevOps Masterclass</span>
                  </span>
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <span className="text-[9px] sm:text-[11px] font-mono text-blue-300 bg-blue-950/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded border border-blue-500/30 truncate max-w-[110px] sm:max-w-none">
                      {playerChapters[activeChapterIndex]?.title.replace(/^\d+\.\s*/, "") || "CI/CD"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="p-1 sm:p-1.5 rounded bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
                      title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      aria-label="Toggle audio mute"
                    >
                      {isMuted ? (
                        <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      ) : (
                        <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Center Play / Pause Floating Button */}
                <div className="relative z-10 flex items-center justify-center my-auto pointer-events-none">
                  <div 
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                      isPlaying 
                        ? 'bg-black/40 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 border border-white/20' 
                        : 'bg-blue-600 text-white opacity-100 scale-100 shadow-blue-500/50 ring-4 ring-blue-500/30'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Bottom Controls Bar */}
                <div 
                  className="relative z-10 p-2.5 sm:p-3 pt-2 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Time + Controls Row */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-300 mb-1.5 px-0.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="text-slate-300 hover:text-white transition-colors p-0.5"
                        title={isPlaying ? "Pause" : "Play"}
                        aria-label="Play or Pause"
                      >
                        {isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                      </button>
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={togglePlaybackRate}
                        className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="Playback speed"
                      >
                        {playbackRate}x
                      </button>
                      <button
                        type="button"
                        onClick={handleFullscreen}
                        className="text-slate-400 hover:text-white transition-colors p-0.5"
                        title="Fullscreen"
                        aria-label="Toggle Fullscreen"
                      >
                        <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Progress Bar */}
                  <div 
                    ref={progressBarRef}
                    className="w-full py-1.5 -my-1 cursor-pointer group/bar"
                    onClick={handleSeek}
                  >
                    <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-800/90 overflow-hidden relative group-hover/bar:h-2.5 transition-all">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-[width] duration-100 relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-sm rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Live Chapter Breakdown List */}
              <div className="space-y-1.5 sm:space-y-2 text-xs">
                {playerChapters.map((chap, idx) => {
                  const isActive = activeChapterIndex === idx;
                  const isCompleted = activeChapterIndex > idx;
                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => handleChapterClick(chap.time)}
                      className={`w-full text-left p-2 sm:p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] gap-2 ${
                        isActive
                          ? 'bg-blue-950/60 border-blue-500/50 shadow-sm shadow-blue-500/10'
                          : isCompleted
                          ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isActive ? (
                          <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400 animate-pulse shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className={`font-medium truncate text-xs ${isActive ? 'text-white font-semibold' : ''}`}>
                          {chap.title}
                        </span>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-mono shrink-0 ${
                        isActive 
                          ? 'text-blue-400 font-semibold' 
                          : isCompleted 
                          ? 'text-slate-400' 
                          : 'text-slate-500'
                      }`}>
                        {isActive ? 'Playing' : isCompleted ? 'Completed' : chap.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Features Grid */}
          <div className="lg:col-span-6 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 order-2 lg:order-2 w-full">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.gradient} text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
