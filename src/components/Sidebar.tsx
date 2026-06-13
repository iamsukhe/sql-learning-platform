import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Problem, chapters } from '../data/problems';
import { Search, CheckCircle2, Circle, Sparkles, ChevronDown, ChevronRight, FolderMinus } from 'lucide-react';

interface SidebarProps {
  problems: Problem[]; // flat array of all lessons for search/counting
  currentProblemId: string;
  onSelectProblem: (id: string) => void;
  solvedProblems: string[];
  isOpen: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  onToggleSolve: (id: string) => void;
}

export default function Sidebar({
  problems,
  currentProblemId,
  onSelectProblem,
  solvedProblems,
  isOpen,
  width,
  onWidthChange,
  onToggleSolve
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(220, Math.min(500, startWidth + deltaX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Track expanded state of chapters
  const [expandedChapters, setExpandedChapters] = useState<{ [chapterId: string]: boolean }>({});

  const activeLessonRef = useRef<HTMLDivElement | null>(null);

  // Scroll active lesson into view when it changes or when the active chapter is expanded
  const activeChapterId = useMemo(() => {
    const parentCh = chapters.find(ch => ch.lessons.some(l => l.id === currentProblemId));
    return parentCh?.id || '';
  }, [currentProblemId]);

  const isActiveChapterExpanded = expandedChapters[activeChapterId];

  useEffect(() => {
    if (activeLessonRef.current && isActiveChapterExpanded) {
      const timer = setTimeout(() => {
        activeLessonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentProblemId, isActiveChapterExpanded]);

  // Load expanded chapters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sqlquest-expanded-chapters');
    if (saved) {
      const timer = setTimeout(() => {
        try {
          setExpandedChapters(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-expand active chapter on mount or active change
  useEffect(() => {
    const parentCh = chapters.find(ch => ch.lessons.some(l => l.id === currentProblemId));
    if (parentCh) {
      const timer = setTimeout(() => {
        setExpandedChapters(prev => {
          const next = { ...prev, [parentCh.id]: true };
          localStorage.setItem('sqlquest-expanded-chapters', JSON.stringify(next));
          return next;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentProblemId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = {
        ...prev,
        [chapterId]: !prev[chapterId]
      };
      localStorage.setItem('sqlquest-expanded-chapters', JSON.stringify(next));
      return next;
    });
  };

  const collapseAll = () => {
    setExpandedChapters({});
    localStorage.setItem('sqlquest-expanded-chapters', JSON.stringify({}));
  };

  // Filter lessons inside chapters
  const filteredChapters = useMemo(() => {
    return chapters.map(ch => {
      const filteredLessons = ch.lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });

      return {
        ...ch,
        lessons: filteredLessons
      };
    }).filter(ch => ch.lessons.length > 0 || searchTerm === ''); // Keep all if no search, else filter empty chapters
  }, [searchTerm]);

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;

  return (
    <aside 
      style={{
        '--sidebar-width': `${width}px` 
      } as React.CSSProperties}
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 w-[280px] lg:static lg:translate-x-0 lg:w-[var(--sidebar-width)] relative ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
    >
      {/* Stats Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/15 flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Course Progress</div>
            <div className="text-base font-bold text-slate-200 flex items-baseline gap-1 mt-0.5">
              {solvedCount} <span className="text-xs text-slate-400 font-normal">/ {totalCount} Solved</span>
            </div>
          </div>
          <button 
            onClick={collapseAll}
            className="text-[9px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors bg-slate-950 border border-slate-800/80 hover:border-slate-700 px-2 py-1 rounded cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Collapse All Chapters"
          >
            <FolderMinus size={11} className="text-cyan-400" />
            <span>Collapse All</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: totalCount > 0 ? `${(solvedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search syllabus..."
            className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs placeholder-slate-600 outline-none focus:border-cyan-500/80 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chapters Accordion List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {filteredChapters.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No topics found
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const isOpen = expandedChapters[chapter.id];
            
            // Calculate completed count in this chapter
            const chapterSolvedCount = chapter.lessons.filter(l => solvedProblems.includes(l.id)).length;
            const chapterTotalCount = chapter.lessons.length;
            const isChapterCompleted = chapterTotalCount > 0 && chapterSolvedCount === chapterTotalCount;

            return (
              <div key={chapter.id} className="flex flex-col border border-slate-800 rounded bg-slate-950/10 overflow-hidden shrink-0">
                {/* Accordion Header */}
                <div 
                  className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-colors select-none text-xs font-semibold"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {isOpen ? <ChevronDown size={14} className="text-slate-500 shrink-0" /> : <ChevronRight size={14} className="text-slate-500 shrink-0" />}
                    <span 
                      className={`break-words whitespace-normal text-left flex-1 py-0.5 leading-relaxed ${isChapterCompleted ? 'text-emerald-400' : 'text-slate-200'}`}
                    >
                      {chapter.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold shrink-0 ml-2">
                    {chapterSolvedCount}/{chapterTotalCount}
                  </span>
                </div>

                {/* Accordion Lessons List */}
                {isOpen && (
                  <div className="flex flex-col py-1 bg-slate-950/20 border-t border-slate-900/60">
                    {chapter.lessons.length === 0 ? (
                      <div className="px-3.5 py-2 text-slate-500 text-xs italic">
                        No matching lessons
                      </div>
                    ) : (
                      chapter.lessons.map((lesson) => {
                        const isSelected = lesson.id === currentProblemId;
                        const isSolved = solvedProblems.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            ref={isSelected ? activeLessonRef : null}
                            className={`px-3.5 py-2 flex items-center justify-between cursor-pointer border-l-2 border-transparent hover:bg-slate-900/30 transition-colors ${isSelected ? 'bg-slate-900/50 border-cyan-500' : ''}`}
                            onClick={() => onSelectProblem(lesson.id)}
                          >
                            <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSolve(lesson.id);
                                }}
                                className="p-0.5 rounded hover:bg-slate-800/80 text-slate-500 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                                title={isSolved ? "Mark as Incomplete" : "Mark as Completed"}
                              >
                                {isSolved ? (
                                  <CheckCircle2 size={13} className="text-emerald-400 fill-emerald-500/10" />
                                ) : (
                                  <Circle size={13} className="text-slate-600" />
                                )}
                              </button>
                              <span 
                                className={`break-words whitespace-normal text-left flex-1 text-xs py-0.5 leading-relaxed ${isSelected ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
                              >
                                {lesson.title.split(': ')[1] || lesson.title}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/15 text-[10px] text-slate-500 flex flex-col gap-2 shrink-0 leading-normal">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-cyan-400 shrink-0" />
          <span className="font-semibold">Unified Coding & Learning Platform</span>
        </div>
        <div className="text-[9px] text-slate-500 border-t border-slate-800/50 pt-1.5 leading-relaxed font-normal">
          These notes are from Code Help. Special thanks to them; this platform was created solely for learning purposes. Visit <a href="https://www.codehelp.in/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">Code Help</a> for more great content.
        </div>
      </div>
      {/* Drag handle for resizing on desktop */}
      <div 
        className="hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-cyan-500/40 active:bg-cyan-500 transition-colors z-50 select-none"
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}
