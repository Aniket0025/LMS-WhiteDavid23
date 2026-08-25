import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Gauge,
  Lock,
  ShieldAlert,
  Subtitles,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';
import './OpenVideoPlayer.css';

const OpenVideoPlayer = ({
  src,
  poster,
  title = 'Course Lecture Video',
  onEnded,
  user,
  isEmbed = false,
  embedSrc = ''
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const seekerRef = useRef(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Features State
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [zoomLevel, setZoomLevel] = useState(1.0); // 0.5x to 3.0x
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => Math.min(parseFloat((prev + 0.25).toFixed(2)), 3.0));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => Math.max(parseFloat((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleResetZoom = (e) => {
    if (e) e.stopPropagation();
    setZoomLevel(1.0);
  };

  // Anti-download Keyboard Protection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'u', 'U'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, rotation]);

  // Video Element Listeners for Direct Video
  useEffect(() => {
    const v = videoRef.current;
    if (!v || isEmbed) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!seekerRef.current) setCurrentTime(v.currentTime);
    };
    const onDurationChange = () => setDuration(v.duration || 0);
    const onEndedHandler = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('loadedmetadata', onDurationChange);
    v.addEventListener('ended', onEndedHandler);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('loadedmetadata', onDurationChange);
      v.removeEventListener('ended', onEndedHandler);
    };
  }, [src, isEmbed, onEnded]);

  // Fullscreen Event Listener
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Control Handlers
  const togglePlayPause = (e) => {
    if (e) e.stopPropagation();
    if (!isEmbed && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds, e) => {
    if (e) e.stopPropagation();
    if (!isEmbed && videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (!isEmbed && videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleRotate = (e) => {
    if (e) e.stopPropagation();
    const next = (rotation + 90) % 360;
    setRotation(next);
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      if (next === 90 || next === 270) {
        window.screen.orientation.lock('landscape').catch(() => {});
      } else {
        window.screen.orientation.unlock?.();
      }
    }
  };

  const handleSpeedChange = (speed, e) => {
    if (e) e.stopPropagation();
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (!isEmbed && videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!isEmbed && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const toggleCaptions = (e) => {
    if (e) e.stopPropagation();
    setCaptionsEnabled(!captionsEnabled);
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec < 0) return '0:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="open-player-wrapper relative w-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Top Media Screen Area */}
      <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
        {/* Security Watermark Badge */}
        <div className="watermark-badge">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Protected Stream • {user?.email || user?.name || 'Verified Content'}</span>
        </div>

        {/* Media Render Box with Rotation & Zoom Transform */}
        <div 
          className={`video-transform-box rotate-${rotation}`}
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease-out' }}
        >
          {isEmbed ? (
            <div className="embed-iframe-clip-wrapper">
              <iframe
                ref={iframeRef}
                src={embedSrc}
                title={title}
                className="embed-clipped-iframe"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              poster={poster}
              className="w-full h-full object-contain cursor-pointer"
              controlsList="nodownload noremoteplayback"
              playsInline
              onClick={togglePlayPause}
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={src} type="video/mp4" />
              <source src={src} type="video/webm" />
              Your browser does not support HTML5 video.
            </video>
          )}

          {/* Center Play Overlay when Paused for Direct Video */}
          {!isEmbed && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-md transform transition hover:scale-110">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="always-visible-toolbar bg-slate-900 border-t border-slate-800 p-2.5 sm:p-3 z-30 min-w-0 w-full">
        {isEmbed ? (
          /* Embed Media: Render ONLY Rotate and Zoom Options */
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Media Viewer</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Zoom Controls Box */}
              <div className="flex items-center space-x-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1.5 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs font-bold text-slate-200 hover:text-white transition-colors min-w-[42px] text-center"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3.0}
                  className="p-1.5 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              {/* Rotate Screen Button */}
              <button
                onClick={handleRotate}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                  rotation !== 0
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title="Rotate Screen"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>{rotation}°</span>
              </button>

              {/* Fullscreen Mode Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 sm:px-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold border border-blue-500/80 transition-colors flex items-center space-x-1 shadow-sm"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
          </div>
        ) : (
          /* Direct Video Toolbar */
          <div className="flex flex-col gap-2.5 w-full">
            {/* Seeker / Progress Slider Row */}
            <div className="flex items-center space-x-2.5 w-full">
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono shrink-0">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 flex items-center h-4 cursor-pointer">
                <div className="absolute left-0 right-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => { seekerRef.current = true; }}
                  onMouseUp={() => { seekerRef.current = false; }}
                  onTouchStart={() => { seekerRef.current = true; }}
                  onTouchEnd={() => { seekerRef.current = false; }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Action Buttons Row */}
            <div className="flex items-center justify-between w-full gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
              
              {/* Left Action Group */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="p-2 sm:px-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all shadow-md shadow-blue-600/20"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span className="hidden xs:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {/* Rewind -10s */}
                <button
                  onClick={(e) => skipTime(-10, e)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center space-x-1 border border-slate-700 transition-colors"
                  title="Rewind 10 Seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">-10s</span>
                </button>

                {/* Forward +10s */}
                <button
                  onClick={(e) => skipTime(10, e)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center space-x-1 border border-slate-700 transition-colors"
                  title="Forward 10 Seconds"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">+10s</span>
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={toggleMute}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700/60"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                </button>
              </div>

              {/* Right Action Group */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                
                {/* Zoom Controls Box */}
                <div className="flex items-center space-x-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  <button
                    onClick={handleResetZoom}
                    className="px-1.5 py-0.5 text-[11px] font-bold text-slate-200 hover:text-white transition-colors min-w-[36px] text-center"
                    title="Reset Zoom"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>

                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3.0}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>

                {/* Playback Speed Selector */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu(!showSpeedMenu);
                    }}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all ${
                      playbackSpeed !== 1
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                    title="Playback Speed"
                  >
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[90px]">
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={(e) => handleSpeedChange(speed, e)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                            playbackSpeed === speed ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Captions / CC Toggle */}
                <button
                  onClick={toggleCaptions}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1 ${
                    captionsEnabled
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle Captions"
                >
                  <Subtitles className="w-4 h-4" />
                  <span className="text-[10px] font-bold">CC</span>
                </button>

                {/* Rotate Screen Button */}
                <button
                  onClick={handleRotate}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all ${
                    rotation !== 0
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Rotate Screen (R)"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{rotation}°</span>
                </button>

                {/* Fullscreen Mode Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1"
                  title="Toggle Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenVideoPlayer;
