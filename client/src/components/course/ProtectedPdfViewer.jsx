import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCw,
  Lock,
  ShieldAlert,
  Sparkles,
  FileText,
  Hash,
  X,
  ArrowRight
} from 'lucide-react';
import './ProtectedPdfViewer.css';

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ProtectedPdfViewer = ({
  url,
  title = 'Course Lecture Document',
  user,
  isFullscreenModal = false,
  onClose
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const pageInputRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFs, setIsFs] = useState(false);

  // Direct Jump to Page states
  const [jumpPageInput, setJumpPageInput] = useState('1');
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [modalPageInput, setModalPageInput] = useState(1);

  // Sync jump input with pageNum when not editing
  useEffect(() => {
    if (!isEditingPage) {
      setJumpPageInput(String(pageNum));
    }
    setModalPageInput(pageNum);
  }, [pageNum, isEditingPage]);

  // Keyboard shortcut protection (Block Ctrl+S, Ctrl+P, Ctrl+U, etc.) and page navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'Home') {
        jumpToPage(1);
      } else if (e.key === 'End' && numPages) {
        jumpToPage(numPages);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, pageNum]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFs(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Load the PDF Document via proxy URL
  useEffect(() => {
    if (!url) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({
      url,
      withCredentials: true,
      maxImageSize: 1024 * 1024 * 16,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF.js loading error:', err);
        setError(err.message || 'Failed to load protected PDF document');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask?.cancel) {
        try {
          loadingTask.cancel();
        } catch (e) {}
      }
    };
  }, [url]);

  // Auto-fit scale to container on initial load and window resize
  const autoFitScale = useCallback((page) => {
    if (!containerRef.current || !page) return;
    const containerWidth = containerRef.current.clientWidth || window.innerWidth;
    const unscaledViewport = page.getViewport({ scale: 1.0, rotation });
    // Fit width with 24px padding on mobile, 48px on desktop
    const padding = containerWidth < 640 ? 16 : 48;
    const targetWidth = Math.max(containerWidth - padding, 280);
    const calculatedScale = Math.min(Math.max(targetWidth / unscaledViewport.width, 0.4), 2.5);
    setScale(parseFloat(calculatedScale.toFixed(2)));
  }, [rotation]);

  // Trigger auto-fit once document is loaded
  useEffect(() => {
    if (pdfDoc && pageNum) {
      pdfDoc.getPage(pageNum).then((page) => {
        autoFitScale(page);
      }).catch(() => {});
    }
  }, [pdfDoc, autoFitScale]);

  // Render the current page onto the HTML5 Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    pdfDoc.getPage(pageNum).then((page) => {
      if (isCancelled || !canvasRef.current) return;

      // Cancel any ongoing render task before starting a new one
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale, rotation });

      // Handle HiDPI / Retina displays
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

      const renderContext = {
        canvasContext: context,
        transform,
        viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;

      task.promise
        .catch((err) => {
          if (err.name !== 'RenderingCancelledException') {
            console.error('Page render error:', err);
          }
        });
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  // Direct Jump To Page
  const jumpToPage = (target) => {
    const page = parseInt(target, 10);
    if (isNaN(page)) {
      setJumpPageInput(String(pageNum));
      setModalPageInput(pageNum);
      setIsEditingPage(false);
      return;
    }
    const clamped = Math.max(1, Math.min(page, numPages || 1));
    setPageNum(clamped);
    setJumpPageInput(String(clamped));
    setModalPageInput(clamped);
    setIsEditingPage(false);
  };

  const handlePageFormSubmit = (e) => {
    e.preventDefault();
    jumpToPage(jumpPageInput);
    if (pageInputRef.current) {
      pageInputRef.current.blur();
    }
  };

  const handlePageInputChange = (e) => {
    setJumpPageInput(e.target.value);
    setIsEditingPage(true);
  };

  const handlePageInputFocus = (e) => {
    setIsEditingPage(true);
    e.target.select();
  };

  const handlePageInputBlur = () => {
    jumpToPage(jumpPageInput);
  };

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      jumpToPage(jumpPageInput);
      e.target.blur();
    } else if (e.key === 'Escape') {
      setJumpPageInput(String(pageNum));
      setIsEditingPage(false);
      e.target.blur();
    }
  };

  // Page Controls
  const goToPrevPage = () => {
    setPageNum((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNum((prev) => Math.min(prev + 1, numPages));
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(parseFloat((prev + 0.2).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(parseFloat((prev - 0.2).toFixed(2)), 0.4));
  };

  const handleResetZoom = () => {
    if (pdfDoc) {
      pdfDoc.getPage(pageNum).then((page) => {
        autoFitScale(page);
      }).catch(() => setScale(1.0));
    } else {
      setScale(1.0);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`protected-pdf-container select-none ${isFs ? 'is-fullscreen' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Top Controls Toolbar — strictly read-only, ZERO download options */}
      <div className="pdf-toolbar">
        {/* Left: Protected Status & Title */}
        <div className="pdf-toolbar-left min-w-0">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-md text-[10px] sm:text-xs font-semibold text-emerald-400 shrink-0">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="hidden xs:inline">Protected View</span>
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate hidden sm:inline max-w-[200px]">
            {title}
          </span>
        </div>

        {/* Center: Page Controls with Direct Jump Input */}
        <div className="pdf-toolbar-center">
          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1 || loading}
            className="pdf-btn"
            title="Previous Page (Left Arrow)"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form
            onSubmit={handlePageFormSubmit}
            className="pdf-page-form"
          >
            <input
              ref={pageInputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={numPages || 1}
              value={jumpPageInput}
              onChange={handlePageInputChange}
              onFocus={handlePageInputFocus}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              disabled={loading || numPages <= 1}
              className="pdf-page-input font-mono"
              title="Click or tap to type page number and press Enter/Go to jump"
              aria-label="Direct jump to page number"
            />
            <button
              type="button"
              onClick={() => {
                setModalPageInput(pageNum);
                setShowJumpModal(true);
              }}
              className="pdf-page-slash-total font-mono"
              title="Click for Direct Jump Modal & Page Slider"
            >
              / {numPages || 1}
            </button>

            {isEditingPage && String(jumpPageInput) !== String(pageNum) && (
              <button
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
                className="pdf-page-go-btn"
                title="Jump directly to page"
              >
                Go
              </button>
            )}
          </form>

          <button
            onClick={goToNextPage}
            disabled={pageNum >= numPages || loading}
            className="pdf-btn"
            title="Next Page (Right Arrow)"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Orientation Controls */}
        <div className="pdf-toolbar-right">
          <div className="pdf-zoom-group">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.4 || loading}
              className="pdf-btn"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetZoom}
              className="pdf-zoom-label"
              title="Fit to Width / Reset Zoom"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.0 || loading}
              className="pdf-btn"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            disabled={loading}
            className="pdf-btn hidden sm:flex"
            title="Rotate Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="pdf-btn"
            title={isFs ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFs ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive Top Reading Progress Track - click anywhere to jump */}
      {numPages > 1 && (
        <div
          className="pdf-progress-track"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const targetPage = Math.max(1, Math.min(numPages, Math.round(percentage * numPages)));
            jumpToPage(targetPage);
          }}
          title={`Page ${pageNum} of ${numPages} - Click anywhere along the line to jump`}
        >
          <div
            className="pdf-progress-fill"
            style={{ width: `${(pageNum / numPages) * 100}%` }}
          />
        </div>
      )}

      {/* Quick Jump to Page Modal / Scrubber */}
      {showJumpModal && (
        <div
          className="pdf-jump-modal-backdrop"
          onClick={() => setShowJumpModal(false)}
        >
          <div
            className="pdf-jump-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pdf-jump-header">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Jump to Page</span>
              </div>
              <button
                type="button"
                onClick={() => setShowJumpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Direct numeric input with Jump button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  jumpToPage(modalPageInput);
                  setShowJumpModal(false);
                }}
                className="flex items-center space-x-2"
              >
                <label className="text-xs text-slate-300 font-medium">Page:</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={numPages || 1}
                  value={modalPageInput}
                  onChange={(e) => setModalPageInput(e.target.value)}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg text-sm font-bold text-white text-center font-mono outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">of {numPages}</span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ml-auto flex items-center space-x-1"
                >
                  <span>Go</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Slider scrubber */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Page 1</span>
                  <span className="text-blue-400 font-bold">
                    {modalPageInput || pageNum} / {numPages} ({Math.round(((modalPageInput || pageNum) / (numPages || 1)) * 100)}%)
                  </span>
                  <span>Page {numPages}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={numPages || 1}
                  value={modalPageInput || pageNum}
                  onChange={(e) => setModalPageInput(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    jumpToPage(1);
                    setShowJumpModal(false);
                  }}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg text-center active:scale-95 transition-all"
                >
                  Page 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    jumpToPage(Math.max(1, Math.round(numPages * 0.33)));
                    setShowJumpModal(false);
                  }}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg text-center active:scale-95 transition-all"
                >
                  33%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    jumpToPage(Math.max(1, Math.round(numPages * 0.66)));
                    setShowJumpModal(false);
                  }}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg text-center active:scale-95 transition-all"
                >
                  66%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    jumpToPage(numPages);
                    setShowJumpModal(false);
                  }}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg text-center active:scale-95 transition-all"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Viewport Area */}
      <div className="pdf-canvas-wrapper" onContextMenu={(e) => e.preventDefault()}>
        {loading ? (
          <div className="pdf-state-box">
            <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium text-slate-300">Loading protected document...</p>
            <p className="text-[10px] text-slate-500 mt-1">Rendered with zero-download protection</p>
          </div>
        ) : error ? (
          <div className="pdf-state-box text-center p-6">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white mb-1">Unable to Render Document</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">{error}</p>
          </div>
        ) : (
          <div className="pdf-page-wrapper">
            <canvas
              ref={canvasRef}
              className="pdf-canvas shadow-2xl"
              onContextMenu={(e) => e.preventDefault()}
            />
            {/* Security Watermark Overlay */}
            <div className="pdf-security-overlay" onContextMenu={(e) => e.preventDefault()}>
              <span className="pdf-watermark-text">
                Protected Document • {user?.email || 'WhiteDavid23 LMS'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Security Info Footer */}
      <div className="pdf-footer-bar">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Download & Print Restricted by LMS Security Policy</span>
        </span>
        <span className="hidden sm:inline">• Verified Read-Only Stream</span>
      </div>
    </div>
  );
};

export default ProtectedPdfViewer;
