import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface PDFRenderTask {
  promise: Promise<void>;
  cancel: () => void;
}

interface PDFPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => PDFRenderTask;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPage>;
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (url: string) => {
        promise: Promise<PDFDocumentProxy>;
      };
    };
  }
}

interface PdfPageItemProps {
  pageNum: number;
  pdfDoc: PDFDocumentProxy;
  scale: number;
}

function PdfPageItem({ pageNum, pdfDoc, scale }: PdfPageItemProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<PDFRenderTask | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const renderedScaleRef = useRef<number | null>(null);

  // Intersection observer to lazy render
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '400px 0px' } // Preload when 400px near viewport
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Trigger render when visible, doc is loaded, scale is set, and scale changed
  useEffect(() => {
    if (!isVisible || !pdfDoc) return;
    if (renderedScaleRef.current === scale) return;

    let active = true;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!active) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport
        };

        // Cancel previous rendering for this page
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        
        if (active) {
          renderedScaleRef.current = scale;
        }
      } catch (err) {
        const error = err as { name?: string } | null;
        if (error && error.name !== 'Heading' && error.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNum}:`, err);
        }
      }
    };

    render();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isVisible, pdfDoc, pageNum, scale]);

  return (
    <div 
      ref={containerRef}
      id={`pdf-page-${pageNum}`}
      className="flex flex-col items-center justify-center bg-white border border-slate-800 rounded shadow-md overflow-hidden select-none mx-auto max-w-full"
      style={{ minHeight: '450px' }} // placeholder before loading page
    >
      <canvas ref={canvasRef} className="max-w-full h-auto block" />
      <div className="py-2 text-[10px] text-slate-500 font-bold bg-slate-900 border-t border-slate-800 w-full text-center">
        Page {pageNum}
      </div>
    </div>
  );
}

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [activePdfUrl, setActivePdfUrl] = useState<string>(pdfUrl);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputVal, setInputVal] = useState<string>('1');
  
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. Asynchronously load PDF.js from CDN
  useEffect(() => {
    let active = true;
    
    const initPdf = async () => {
      try {
        if (!window.pdfjsLib) return;
        const loadingTask = window.pdfjsLib.getDocument(activePdfUrl);
        const pdf = await loadingTask.promise;
        if (!active) return;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };

    const loadPdfJs = async () => {
      if (window.pdfjsLib) {
        initPdf();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.async = true;
      script.onload = () => {
        if (!active) return;
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }
        initPdf();
      };
      document.body.appendChild(script);
    };

    loadPdfJs();

    return () => {
      active = false;
    };
  }, [activePdfUrl]);

  // Keep input in sync with currentPage, unless currently editing
  useEffect(() => {
    const timer = setTimeout(() => {
      setInputVal(String(currentPage));
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const scrollToPage = useCallback((pageNum: number) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 2. Scroll event observer to find the active page in view
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !pdfDoc) return;
    const container = containerRef.current;
    
    // Find middle line of viewport
    const containerCenter = container.getBoundingClientRect().top + container.clientHeight / 2;
    
    let activePage = 1;
    let minDistance = Infinity;

    for (let i = 1; i <= numPages; i++) {
      const pageEl = document.getElementById(`pdf-page-${i}`);
      if (pageEl) {
        const rect = pageEl.getBoundingClientRect();
        
        // Calculate distance from center of page component to center of viewport
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - containerCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          activePage = i;
        }
      }
    }
    
    setCurrentPage(activePage);
  }, [pdfDoc, numPages]);

  const goToNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  // 3. Arrow key binding to scroll page-by-page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextPage = Math.min(currentPage + 1, numPages);
        scrollToPage(nextPage);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevPage = Math.max(currentPage - 1, 1);
        scrollToPage(prevPage);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, scrollToPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputVal);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      scrollToPage(val);
    } else {
      setInputVal(String(currentPage));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.7));
  const handleResetZoom = () => setScale(1.2);
  
  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page) => {
      const containerWidth = containerRef.current!.clientWidth - 48; // padding
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const newScale = containerWidth / unscaledViewport.width;
      setScale(newScale);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* PDF Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0 z-10 select-none">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft size={16} />
          </button>
          
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <input
              type="text"
              value={inputVal}
              onChange={handlePageInputChange}
              className="w-12 px-1.5 py-1 text-center bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-200 rounded font-semibold text-xs outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <span className="px-1">/</span>
            <span className="text-slate-400 font-semibold">{numPages}</span>
          </form>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* PDF Document Selection */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider text-slate-500">Document:</span>
          <select
            value={activePdfUrl}
            onChange={(e) => {
              setActivePdfUrl(e.target.value);
              setIsLoading(true);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1.5 rounded outline-none focus:border-cyan-500 cursor-pointer transition-all"
          >
            <option value="/Full Notes.pdf">Class Textbook (Full Notes)</option>
            <option value="/50 SQL Queries.pdf">50 SQL Practice Queries (Code Help)</option>
          </select>
        </div>

        {/* Zoom & Utility Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleFitWidth}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1"
            title="Fit to Width"
          >
            <Maximize2 size={12} />
            Fit
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-750 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* PDF Page Canvas Workspace */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 flex flex-col items-center bg-slate-950/40 select-none custom-scroll scroll-smooth"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
            <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading PDF slides reader...</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Learning Disclaimer Banner */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded shadow-md text-xs text-slate-400 leading-relaxed text-center">
              These notes are from Code Help. Special thanks to them; this platform was created solely for learning purposes. Visit <a href="https://www.codehelp.in/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">Code Help</a> for more great content.
            </div>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              pdfDoc && (
                <PdfPageItem 
                  key={pageNum} 
                  pageNum={pageNum} 
                  pdfDoc={pdfDoc} 
                  scale={scale} 
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
