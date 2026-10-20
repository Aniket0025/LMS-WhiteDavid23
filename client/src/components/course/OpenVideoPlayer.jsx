import React, { useEffect, useRef, useState, useCallback } from 'react';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';
import {
  RotateCw,
  Lock,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize
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
  const playerInstanceRef = useRef(null);
  // Key to force re-mount the <video> element when src changes
  const [videoKey, setVideoKey] = useState(0);

  // Features State
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Fluid Player Initialization & Cleanup ---
  const destroyPlayer = useCallback(() => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (e) {
        // Fluid Player destroy can throw if DOM was already cleaned
      }
      playerInstanceRef.current = null;
    }
  }, []);

  // When src changes, destroy old player and force new <video> DOM element
  useEffect(() => {
    if (isEmbed) return;
    destroyPlayer();
    setVideoKey((k) => k + 1);
  }, [src, isEmbed, destroyPlayer]);

  // After the new <video> element mounts, initialize Fluid Player
  useEffect(() => {
    if (isEmbed || !videoRef.current) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      try {
        const player = fluidPlayer(videoRef.current, {
          layoutControls: {
            fillToContainer: true,
            posterImage: poster || false,
            posterImageSize: 'cover',
            playbackRateEnabled: true,
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true,
              playbackRates: ['x2', 'x1.75', 'x1.5', 'x1.25', 'x1', 'x0.75', 'x0.5']
            },
            allowTheatre: true,
            theatreSettings: {
              width: '100%',
              height: '80vh',
              marginTop: 0,
              horizontalAlign: 'center',
              keepPosition: true
            },
            miniPlayer: {
              enabled: true,
              width: 400,
              height: 225,
              widthMobile: 280,
              placeholderText: 'Playing in mini player...'
            },
            doubleclickFullscreen: true,
            autoPlay: false,
            mute: false,
            keyboardControl: true,
            persistentSettings: {
              volume: true,
              quality: true,
              speed: true,
              theatre: true
            },
            primaryColor: '#3b82f6',
            roundedCorners: 0,
            contextMenu: {
              controls: true,
              links: [
                {
                  href: '#',
                  label: '📚 Protected Content — WhiteDavid23 LMS'
                }
              ]
            },
            allowDownload: false,
            title: title,
            layout: 'default'
          },
          vastOptions: {
            adList: []
          }
        });

        playerInstanceRef.current = player;

        // Listen for video ended
        if (onEnded) {
          player.on('ended', () => {
            onEnded();
          });
        }
      } catch (err) {
        console.error('Fluid Player initialization error:', err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [videoKey, isEmbed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer]);

  // --- Zoom & Rotation ---
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

  const handleRotate = (e) => {
    if (e) e.stopPropagation();
    const next = (rotation + 90) % 360;
    setRotation(next);
    if (window.screen?.orientation?.lock) {
      if (next === 90 || next === 270) {
        window.screen.orientation.lock('landscape').catch(() => {});
      } else {
        window.screen.orientation.unlock?.();
      }
    }
  };

  // Anti-download keyboard protection
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  // Compute transform for zoom + rotation
  const getTransformStyle = () => {
    const transforms = [];
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    if (zoomLevel !== 1.0) transforms.push(`scale(${zoomLevel})`);
    // Scale down when rotated 90/270 so video fits within the container
    if (rotation === 90 || rotation === 270) transforms.push('scale(0.72)');
    return {
      transform: transforms.length > 0 ? transforms.join(' ') : 'none',
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  const isTransformed = rotation !== 0 || zoomLevel !== 1.0;

  return (
    <div
      ref={containerRef}
      className="fp-outer-wrapper"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Security Watermark */}
      <div className="fp-watermark">
        <Lock className="w-3 h-3 text-emerald-400" />
        <span>Protected Stream • {user?.email || user?.name || 'Verified Content'}</span>
      </div>

      {/* Main Video Area */}
      <div className="fp-video-area">
        <div className="fp-transform-layer" style={getTransformStyle()}>
          {isEmbed ? (
            <div className="fp-embed-wrapper">
              <iframe
                ref={iframeRef}
                src={embedSrc}
                title={title}
                className="fp-embed-iframe"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="fp-fluid-container">
              {/*
                Key changes on src so React unmounts+remounts the <video>.
                Fluid Player wraps this <video> with its own .fluid_video_wrapper.
                fillToContainer makes it 100% width/height of .fp-fluid-container.
              */}
              <video
                key={videoKey}
                ref={videoRef}
                playsInline
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={src} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Extra Toolbar — Zoom + Rotation (these features don't exist in Fluid Player) */}
      <div className="fp-extra-bar">
        <div className="fp-extra-left">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="fp-extra-label">
            {isEmbed ? 'Media Viewer' : 'Enhanced View'}
          </span>
        </div>

        <div className="fp-extra-right">
          {/* Zoom */}
          <div className="fp-zoom-group">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="fp-zoom-btn"
              title="Zoom Out (−)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="fp-zoom-value"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="fp-zoom-btn"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className={`fp-rotate-btn ${rotation !== 0 ? 'fp-active' : ''}`}
            title="Rotate Screen (R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{rotation}°</span>
          </button>

          {/* Fullscreen — only for embed since Fluid Player has its own */}
          {isEmbed && (
            <button
              onClick={toggleFullscreen}
              className="fp-fullscreen-btn"
              title="Toggle Fullscreen"
            >
              {isFullscreen
                ? <Minimize className="w-4 h-4" />
                : <Maximize className="w-4 h-4" />}
              <span className="fp-fs-text">Fullscreen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenVideoPlayer;
