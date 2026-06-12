"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Sun, Moon, Database, HelpCircle, AlertTriangle, ArrowRight, CheckCircle2, BookOpen, Menu, AlertCircle, FileText, FileCode } from 'lucide-react';
import { problems } from '../data/problems';
import { 
  getSqlLib, 
  executeQuery, 
  evaluateSubmission, 
  fetchSeedTables, 
  QueryResult, 
  EvaluationResult 
} from '../utils/dbEngine';
import Sidebar from '../components/Sidebar';
import SchemaViewer from '../components/SchemaViewer';
import SqlEditor from '../components/SqlEditor';
import ResultsPanel from '../components/ResultsPanel';
import PdfViewer from '../components/PdfViewer';
import ErdViewer from '../components/ErdViewer';

export default function Home() {
  const [activeView, setActiveView] = useState<'sql' | 'notes' | 'cheatsheet' | 'queries50'>('sql');
  const handleSelectView = (view: 'sql' | 'notes' | 'cheatsheet' | 'queries50') => {
    setActiveView(view);
    localStorage.setItem('sqlquest-active-view', view);
  };
  const [currentProblemId, setCurrentProblemId] = useState<string>(problems[0].id);
  const [userCodes, setUserCodes] = useState<{ [problemId: string]: string }>({});
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [seedTables, setSeedTables] = useState<{ [tableName: string]: QueryResult }>({});
  const [loadingTables, setLoadingTables] = useState(false);
  
  const [runResult, setRunResult] = useState<QueryResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'tests'>('input');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Resizing and Splitting states
  const [colSplitPercent, setColSplitPercent] = useState<number>(45);
  const [leftRowSplitPercent, setLeftRowSplitPercent] = useState<number>(55);
  const [rightRowSplitPercent, setRightRowSplitPercent] = useState<number>(50);
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);

  // Initialize sidebar width from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sqlquest-sidebar-width');
    if (saved) {
      const timer = setTimeout(() => {
        setSidebarWidth(parseInt(saved, 10));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSidebarWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('sqlquest-sidebar-width', newWidth.toString());
  };

  // References to track element dimensions during drag resizing
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Column drag split (horizontal)
  const startColResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;
    const startWidthPercent = colSplitPercent;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newPercent = startWidthPercent + (deltaX / containerWidth) * 100;
      setColSplitPercent(Math.max(20, Math.min(80, newPercent)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('select-none', 'cursor-col-resize');
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.classList.add('select-none', 'cursor-col-resize');
  };

  // Left column drag split (vertical)
  const startLeftRowResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const column = leftColRef.current;
    if (!column) return;
    const columnHeight = column.getBoundingClientRect().height;
    const startHeightPercent = leftRowSplitPercent;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPercent = startHeightPercent + (deltaY / columnHeight) * 100;
      setLeftRowSplitPercent(Math.max(20, Math.min(80, newPercent)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('select-none', 'cursor-row-resize');
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.classList.add('select-none', 'cursor-row-resize');
  };

  // Right column drag split (vertical)
  const startRightRowResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const column = rightColRef.current;
    if (!column) return;
    const columnHeight = column.getBoundingClientRect().height;
    const startHeightPercent = rightRowSplitPercent;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPercent = startHeightPercent + (deltaY / columnHeight) * 100;
      setRightRowSplitPercent(Math.max(20, Math.min(80, newPercent)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('select-none', 'cursor-row-resize');
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.classList.add('select-none', 'cursor-row-resize');
  };



  const activeProblem = problems.find(p => p.id === currentProblemId) || problems[0];

  // 1. Initialize Theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem('sqlquest-theme') || localStorage.getItem('leetdbms-theme') || localStorage.getItem('leetsql-theme')) as 'dark' | 'light' || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const timer = setTimeout(() => {
      setTheme(savedTheme);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('sqlquest-theme', nextTheme);
  };

  // 2. Load progress from localStorage
  useEffect(() => {
    const solved = localStorage.getItem('sqlquest-solved') || localStorage.getItem('leetdbms-solved') || localStorage.getItem('leetsql-solved');
    const savedCodes = localStorage.getItem('sqlquest-codes') || localStorage.getItem('leetdbms-codes') || localStorage.getItem('leetsql-codes');
    const savedProblemId = localStorage.getItem('sqlquest-current-problem');
    const savedView = localStorage.getItem('sqlquest-active-view');
    
    const timer = setTimeout(() => {
      if (solved) {
        setSolvedProblems(JSON.parse(solved));
      }
      if (savedCodes) {
        setUserCodes(JSON.parse(savedCodes));
      }
      if (savedProblemId) {
        const exists = problems.some(p => p.id === savedProblemId);
        if (exists) {
          setCurrentProblemId(savedProblemId);
        }
      }
      if (savedView) {
        if (['sql', 'notes', 'cheatsheet', 'queries50'].includes(savedView)) {
          setActiveView(savedView as 'sql' | 'notes' | 'cheatsheet' | 'queries50');
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // 3. Pre-load SQL WASM engine
  useEffect(() => {
    getSqlLib()
      .then(() => setIsDbLoaded(true))
      .catch((err) => {
        console.error(err);
        setDbError(err.message || "Could not load database engine.");
      });
  }, []);

  // 4. Fetch seed tables when current problem changes (only for coding problems)
  useEffect(() => {
    let active = true;
    async function loadData() {
      if (activeProblem.type !== 'coding') {
        await Promise.resolve();
        if (active) {
          setSeedTables({});
        }
        return;
      }
      setLoadingTables(true);
      try {
        await getSqlLib();
        const tables = await fetchSeedTables(activeProblem);
        if (active) {
          setSeedTables(tables);
        }
      } catch (err) {
        console.error("Failed to seed tables", err);
      } finally {
        if (active) setLoadingTables(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [activeProblem]);

  // Code getter/setter
  const currentCode = userCodes[currentProblemId] ?? activeProblem.defaultCode ?? '';
  
  const handleCodeChange = (newCode: string) => {
    const nextCodes = { ...userCodes, [currentProblemId]: newCode };
    setUserCodes(nextCodes);
    localStorage.setItem('sqlquest-codes', JSON.stringify(nextCodes));
  };

  const handleResetCode = () => {
    handleCodeChange(activeProblem.defaultCode ?? '');
    setRunResult(null);
    setSubmissionResult(null);
    setActiveTab('input');
  };

  // Run Code logic
  const handleRunCode = async () => {
    if (!isDbLoaded) return;
    setIsEvaluating(true);
    setActiveTab('output');
    
    try {
      const sqlLib = await getSqlLib();
      const db = new sqlLib.Database();
      
      // Seed database
      if (activeProblem.seedSql) {
        db.run(activeProblem.seedSql);
      }
      
      // Run query
      const result = executeQuery(db, currentCode);
      setRunResult(result);
      db.close();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setRunResult({
        columns: [],
        rows: [],
        error: errorMsg
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit Code logic
  const handleSubmitCode = async () => {
    if (!isDbLoaded) return;
    setIsEvaluating(true);
    setActiveTab('tests');
    
    try {
      const evaluation = await evaluateSubmission(activeProblem, currentCode);
      setSubmissionResult(evaluation);
      
      if (evaluation.success) {
        // Confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Add to solved list
        markProblemSolved(currentProblemId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };



  // Theory completion handler
  const handleCompleteTheory = () => {
    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.7 }
    });
    markProblemSolved(currentProblemId);
  };

  const markProblemSolved = (problemId: string) => {
    if (!solvedProblems.includes(problemId)) {
      const nextSolved = [...solvedProblems, problemId];
      setSolvedProblems(nextSolved);
      localStorage.setItem('sqlquest-solved', JSON.stringify(nextSolved));
    }
  };

  const handleSelectProblem = (id: string) => {
    setCurrentProblemId(id);
    localStorage.setItem('sqlquest-current-problem', id);
    setIsSidebarOpen(false); // Close sidebar drawer on mobile
    
    // Reset coding states
    setRunResult(null);
    setSubmissionResult(null);
    setActiveTab('input');
  };  

  const handleNextLesson = () => {
    const currentIndex = problems.findIndex(p => p.id === currentProblemId);
    if (currentIndex !== -1 && currentIndex < problems.length - 1) {
      const nextProblem = problems[currentIndex + 1];
      handleSelectProblem(nextProblem.id);
    }
  };

  // Check if there is a next lesson
  const hasNextLesson = () => {
    const currentIndex = problems.findIndex(p => p.id === currentProblemId);
    return currentIndex !== -1 && currentIndex < problems.length - 1;
  };

  // Description Parser & formatter (simple but highly styled markdown subset)
  const parseInlineCode = (text: string): React.ReactNode[] => {
    // Regex matches `code`, **bold**, $math$, *italic*, or _italic_ (excluding prices starting with a digit)
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\$[^$0-9][^$]*?\$|\*[^*]+\*|_[^_]+_)/);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={idx} 
            className="bg-slate-950 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold whitespace-nowrap"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        const formatted = mathContent
          .replace(/\\rightarrow/g, '→')
          .replace(/\\cap/g, '∩')
          .replace(/\\emptyset/g, '∅')
          .replace(/\\subseteq/g, '⊆')
          .replace(/\\log/g, 'log')
          .replace(/\\/g, ''); // strip out any raw backslashes
        return (
          <span 
            key={idx} 
            className="font-serif italic text-cyan-300 font-semibold px-1 py-0.5 bg-slate-950/60 border border-slate-900 rounded mx-0.5 text-xs whitespace-nowrap"
          >
            {formatted}
          </span>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-slate-300 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__')) {
        return (
          <em key={idx} className="italic text-slate-300 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderDescription = (desc: string) => {
    const lines = desc.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTableHeaders: string[] | null = null;
    let currentTableRows: string[][] = [];
    let isInsideTable = false;
    let isInsideCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';
    let isInsideDetails = false;
    let detailsContentLines: string[] = [];
    let detailsSummary = '';

    const renderAccumulatedTable = (key: string | number) => {
      if (!isInsideTable) return null;
      isInsideTable = false;
      const headers = currentTableHeaders;
      const rows = currentTableRows;
      currentTableHeaders = null;
      currentTableRows = [];

      return (
        <div key={key} className="overflow-x-auto border border-slate-800 rounded my-4 max-w-full">
          <table className="w-full border-collapse text-sm text-left">
            {headers && (
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800">
                  {headers.map((h, i) => (
                    <th key={i} className="text-cyan-400 p-2.5 font-semibold font-sans">{parseInlineCode(h)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/10 border-b border-slate-900/60 last:border-b-0">
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-slate-300 leading-relaxed font-sans">
                      {parseInlineCode(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check code block markers first
      if (trimmed.startsWith('```')) {
        if (isInsideTable) {
          elements.push(renderAccumulatedTable(`table-pre-code-${i}`));
        }

        if (isInsideCodeBlock) {
          // Close code block
          isInsideCodeBlock = false;
          if (codeBlockLang.startsWith('erd-')) {
            const erdType = codeBlockLang.slice(4) as 'basic' | 'strong-weak' | 'attributes' | 'relationships';
            elements.push(<ErdViewer key={`erd-${i}`} type={erdType} />);
          } else {
            const codeText = codeBlockContent.join('\n');
            elements.push(
              <pre key={`code-${i}`} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 font-mono text-sm text-cyan-400 my-4 overflow-x-auto select-text leading-relaxed">
                <code>{codeText}</code>
              </pre>
            );
          }
          codeBlockContent = [];
          codeBlockLang = '';
        } else {
          // Open code block
          isInsideCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
        }
        continue;
      }

      if (isInsideCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Check details / summary blocks
      if (trimmed.match(/^<details\b[^>]*>/i)) {
        isInsideDetails = true;
        detailsContentLines = [];
        detailsSummary = '';
        continue;
      }

      if (isInsideDetails) {
        const summaryMatch = trimmed.match(/^<summary\b[^>]*>(.*?)<\/summary>/i);
        if (summaryMatch) {
          detailsSummary = summaryMatch[1];
          continue;
        }
        if (trimmed.match(/^<\/details>/i)) {
          isInsideDetails = false;
          const subElements = renderDescription(detailsContentLines.join('\n'));
          elements.push(
            <details key={`details-${i}`} className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3.5 my-4 select-text group">
              <summary className="font-semibold text-xs text-cyan-400 cursor-pointer select-none hover:text-cyan-300 transition-colors list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5 outline-none">
                <span className="text-[9px] text-slate-500 group-open:rotate-90 transition-transform duration-200">▶</span>
                <span>{detailsSummary || 'Reveal Answer'}</span>
              </summary>
              <div className="mt-3.5 pl-3.5 border-l-2 border-slate-800/80 text-sm text-slate-300 leading-relaxed flex flex-col gap-2.5">
                {subElements}
              </div>
            </details>
          );
          continue;
        }
        detailsContentLines.push(line);
        continue;
      }

      // Check table rows
      if (trimmed.startsWith('|')) {
        isInsideTable = true;
        if (trimmed.includes(':---') || trimmed.match(/^\|[\s:|\-]+$/)) {
          continue;
        }
        const cells = line.split('|').map(c => c.trim());
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();

        if (!currentTableHeaders) {
          currentTableHeaders = cells;
        } else {
          currentTableRows.push(cells);
        }
      } else {
        if (isInsideTable) {
          elements.push(renderAccumulatedTable(`table-${i}`));
        }

        if (trimmed === '') {
          elements.push(<div key={i} className="h-3" />);
          continue;
        }

        if (trimmed === '---' || trimmed === '***') {
          elements.push(<hr key={i} className="my-5 border-slate-800" />);
          continue;
        }

        if (trimmed.startsWith('#### ')) {
          elements.push(
            <h5 key={i} className="mt-4 mb-2 text-slate-200 text-sm font-semibold tracking-wide pb-0.5">
              {parseInlineCode(trimmed.slice(5))}
            </h5>
          );
        } else if (trimmed.startsWith('### ')) {
          elements.push(
            <h4 key={i} className="mt-5 mb-2.5 text-slate-200 text-base font-semibold tracking-wide border-b border-slate-800/40 pb-1">
              {parseInlineCode(trimmed.slice(4))}
            </h4>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h3 key={i} className="mt-6 mb-3 text-slate-100 text-lg font-bold tracking-tight border-b border-slate-800 pb-1.5">
              {parseInlineCode(trimmed.slice(3))}
            </h3>
          );
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h2 key={i} className="mt-8 mb-4 text-slate-100 text-xl font-extrabold tracking-tight border-b border-slate-800 pb-2">
              {parseInlineCode(trimmed.slice(2))}
            </h2>
          );
        } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          elements.push(
            <h4 key={i} className="mt-4 mb-2 text-slate-200 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              {parseInlineCode(trimmed.slice(2, -2))}
            </h4>
          );
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          elements.push(
            <li key={i} className="ml-4 mb-1.5 text-slate-400 text-sm list-disc leading-relaxed pl-1.5">
              {parseInlineCode(trimmed.slice(2).trim())}
            </li>
          );
        } else if (trimmed.match(/^\d+\.\s/)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          const num = match ? match[1] : '1';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-2 mb-2 text-slate-400 text-sm leading-relaxed flex items-start gap-2">
              <span className="text-cyan-500 font-semibold font-mono">{num}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else if (trimmed.match(/^[a-zA-Z]\.\s/)) {
          const match = trimmed.match(/^([a-zA-Z])\.\s(.*)/);
          const char = match ? match[1] : 'a';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-6 mb-1.5 text-slate-400 text-sm leading-relaxed flex items-start gap-2">
              <span className="text-slate-500 font-semibold font-mono">{char}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else if (trimmed.match(/^[ivxIVX]+\.\s/)) {
          const match = trimmed.match(/^([ivxIVX]+)\.\s(.*)/);
          const roman = match ? match[1] : 'i';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-10 mb-1.5 text-slate-500 text-sm leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 font-mono">{roman}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else {
          elements.push(
            <p key={i} className="mb-3 text-slate-400 text-sm leading-relaxed">
              {parseInlineCode(trimmed)}
            </p>
          );
        }
      }
    }

    if (isInsideTable) {
      elements.push(renderAccumulatedTable(`table-end`));
    }

    if (isInsideCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre key="code-end" className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 font-mono text-sm text-cyan-400 my-4 overflow-x-auto select-text leading-relaxed">
          <code>{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div className="grid grid-rows-[56px_1fr] h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none animate-theme">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 bg-slate-900 border-b border-slate-800 z-10 select-none">
        {/* Logo & Toggle */}
        <div className="flex items-center gap-2.5">
          {activeView === 'sql' && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 lg:hidden cursor-pointer"
              title="Toggle Syllabus Sidebar"
            >
              <Menu size={16} />
            </button>
          )}
          <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-100">
            <Database size={18} className="text-cyan-400" />
            <span>SQL<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Quest</span></span>
          </div>
        </div>

        {/* Navigation Tabs (SQL Practice, Lecture Notes, Cheat Sheet, 50 Queries) */}
        <div className="flex bg-slate-950/80 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0 gap-1 overflow-x-auto max-w-[50vw] sm:max-w-none no-scrollbar">
          <button
            onClick={() => handleSelectView('sql')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activeView === 'sql'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.2)] font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={13} />
            <span className="hidden sm:inline">SQL Problems</span>
            <span className="sm:hidden">SQL</span>
          </button>
          <button
            onClick={() => handleSelectView('notes')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activeView === 'notes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.2)] font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Lecture Notes</span>
            <span className="sm:hidden">Notes</span>
          </button>
          <button
            onClick={() => handleSelectView('cheatsheet')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activeView === 'cheatsheet'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.2)] font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} />
            <span className="hidden sm:inline">SQL Cheat Sheet</span>
            <span className="sm:hidden">Cheat Sheet</span>
          </button>
          <button
            onClick={() => handleSelectView('queries50')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activeView === 'queries50'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.2)] font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode size={13} />
            <span className="hidden sm:inline">50 SQL Queries</span>
            <span className="sm:hidden">50 Queries</span>
          </button>
        </div>

        {/* Right side stats & theme toggler */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs font-semibold">
            <Sparkles size={14} className="text-cyan-400" />
            <span>{solvedProblems.length} / {problems.length} Completed</span>
          </div>

          <button 
            className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors cursor-pointer" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="h-full w-full overflow-hidden select-none">
        {activeView === 'notes' ? (
          <PdfViewer key="notes" pdfUrl="/Full Notes.pdf" />
        ) : activeView === 'cheatsheet' ? (
          <PdfViewer key="cheatsheet" pdfUrl="/sql_cheatersheet.pdf" />
        ) : activeView === 'queries50' ? (
          <PdfViewer key="queries50" pdfUrl="/50 SQL Queries.pdf" />
        ) : (
          <div 
            style={{
              '--sidebar-width': `${sidebarWidth}px`
            } as React.CSSProperties}
            className="grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_1fr] h-full w-full overflow-hidden relative"
          >
            {/* Sidebar */}
            <Sidebar
              problems={problems}
              currentProblemId={currentProblemId}
              solvedProblems={solvedProblems}
              onSelectProblem={handleSelectProblem}
              isOpen={isSidebarOpen}
              width={sidebarWidth}
              onWidthChange={handleSidebarWidthChange}
            />

            {/* Backdrop overlay for mobile drawer */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden cursor-pointer"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Workspace Panel */}
            {!isDbLoaded ? (
              <div className="flex flex-col items-center justify-center gap-3 h-full bg-slate-950/40 w-full">
                <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading Database Engine...</p>
              </div>
            ) : dbError ? (
              <div className="flex flex-col items-center justify-center gap-3 h-full bg-slate-950/40 w-full">
                <AlertTriangle size={44} className="text-red-500 animate-pulse" />
                <h2 className="text-base font-semibold text-slate-200">Database Engine Error</h2>
                <p className="text-xs text-slate-400 max-w-[380px] leading-relaxed">{dbError}</p>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="flex flex-col gap-4 p-3 h-full overflow-y-auto pb-12 bg-slate-950/20 w-full lg:grid lg:gap-0 lg:overflow-hidden lg:p-4 lg:pb-4"
                style={{
                  gridTemplateColumns: `calc(${colSplitPercent}% - 6px) 12px calc(${100 - colSplitPercent}% - 6px)`
                }}
              >
                
                {/* Coding Sandbox Workspace */}
                {activeProblem.type === 'coding' && (
                  <>
                    {/* Left Column: Description & Schema */}
                    <div 
                      ref={leftColRef}
                      className="flex flex-col gap-4 h-auto lg:h-full lg:overflow-hidden shrink-0 lg:shrink lg:grid lg:gap-0"
                      style={{
                        gridTemplateRows: `calc(${leftRowSplitPercent}% - 6px) 12px calc(${100 - leftRowSplitPercent}% - 6px)`
                      }}
                    >
                      {/* Problem Description Panel */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-auto max-h-[400px] lg:max-h-none lg:h-full shrink-0 lg:shrink">
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                          <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                            <HelpCircle size={16} className="text-cyan-400" />
                            <span>{activeProblem.title}</span>
                          </div>
                        </div>
                        <div className="p-5 flex-1 overflow-y-auto font-serif text-[13px] text-slate-300 leading-relaxed tracking-wide">
                          {renderDescription(activeProblem.description)}
                        </div>
                        <div className="px-5 py-2.5 bg-slate-950/30 border-t border-slate-800/60 text-[10px] text-slate-500 leading-normal flex items-start gap-2 select-none">
                          <AlertCircle size={13} className="text-slate-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Disclaimer:</strong> This is a free learning platform and is not used for any monetary purposes. We compile questions from multiple platforms to streamline SQL learning.
                          </span>
                        </div>
                      </div>

                      {/* Left Row Resizer (horizontal drag handle) */}
                      <div 
                        onMouseDown={startLeftRowResize}
                        className="hidden lg:flex w-full h-[12px] items-center justify-center cursor-row-resize group z-10 select-none"
                      >
                        <div className="h-[1px] w-[20%] bg-slate-800/80 group-hover:bg-cyan-500 transition-colors group-hover:h-[2px] group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      </div>

                      {/* Schema Viewer Panel */}
                      <div className="h-auto max-h-[300px] lg:max-h-none lg:h-full shrink-0 lg:shrink">
                        <SchemaViewer schemas={activeProblem.schema || []} />
                      </div>
                    </div>

                    {/* Column Resizer (vertical drag handle) */}
                    <div 
                      onMouseDown={startColResize}
                      className="hidden lg:flex w-[12px] h-full items-center justify-center cursor-col-resize group z-10 select-none"
                    >
                      <div className="w-[1px] h-[30%] bg-slate-800/80 group-hover:bg-cyan-500 transition-colors group-hover:w-[2px] group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    </div>

                    {/* Right Column: SQL Editor & Output */}
                    <div 
                      ref={rightColRef}
                      className="flex flex-col gap-4 h-auto lg:h-full lg:overflow-hidden shrink-0 lg:shrink lg:grid lg:gap-0"
                      style={{
                        gridTemplateRows: `calc(${rightRowSplitPercent}% - 6px) 12px calc(${100 - rightRowSplitPercent}% - 6px)`
                      }}
                    >
                      {/* Code Editor Panel */}
                      <div className="flex-1 min-h-[300px] lg:min-h-0 overflow-hidden shrink-0 lg:shrink lg:h-full">
                        <SqlEditor
                          value={currentCode}
                          onChange={handleCodeChange}
                          onRun={handleRunCode}
                          onSubmit={handleSubmitCode}
                          onReset={handleResetCode}
                          schemas={activeProblem.schema || []}
                          isEvaluating={isEvaluating}
                        />
                      </div>

                      {/* Right Row Resizer (horizontal drag handle) */}
                      <div 
                        onMouseDown={startRightRowResize}
                        className="hidden lg:flex w-full h-[12px] items-center justify-center cursor-row-resize group z-10 select-none"
                      >
                        <div className="h-[1px] w-[20%] bg-slate-800/80 group-hover:bg-cyan-500 transition-colors group-hover:h-[2px] group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      </div>

                      {/* Results Panel */}
                      <div className="flex-1 min-h-[250px] lg:min-h-0 overflow-hidden shrink-0 lg:shrink lg:h-full">
                        <ResultsPanel
                          seedTables={seedTables}
                          runResult={runResult}
                          submissionResult={submissionResult}
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                          isLoading={loadingTables || isEvaluating}
                          explanation={activeProblem.explanation}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Theory Conceptual Workspace */}
                {activeProblem.type === 'theory' && (
                  <div className="col-span-2 lg:col-span-3 grid grid-cols-[1.5fr_1fr] gap-4 h-full overflow-hidden">
                    {/* Left Column: Reading Content */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                        <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                          <BookOpen size={16} className="text-cyan-400" />
                          <span>{activeProblem.title} - Study Notes</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                          THEORY
                        </span>
                      </div>
                      <div className="p-6 flex-1 overflow-y-auto">
                        {renderDescription(activeProblem.description)}
                      </div>
                      <div className="px-6 py-2.5 bg-slate-950/30 border-t border-slate-800/60 text-[10px] text-slate-500 leading-normal flex items-start gap-2 select-none">
                        <AlertCircle size={13} className="text-slate-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Disclaimer:</strong> This is a free learning platform and is not used for any monetary purposes. We compile questions from multiple platforms to streamline SQL learning.
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Learning Control Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                        <span className="font-semibold text-slate-200 text-sm">Learning Dashboard</span>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          {Math.max(1, Math.round(activeProblem.description.length / 500))} min read
                        </span>
                      </div>
                      <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between">
                        <div className="flex flex-col gap-5">
                          {/* Key Takeaways */}
                          {activeProblem.takeaways && activeProblem.takeaways.length > 0 && (
                            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-cyan-400" />
                                Key Takeaways
                              </h4>
                              <ul className="flex flex-col gap-2">
                                {activeProblem.takeaways.map((takeaway, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                                    <span>{parseInlineCode(takeaway)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Self-Check Questions */}
                          {activeProblem.selfCheck && activeProblem.selfCheck.length > 0 && (
                            <div className="p-4 bg-slate-950/20 border border-slate-800/60 rounded-lg">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                <HelpCircle size={12} className="text-slate-400" />
                                Self-Reflection Questions
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                                Contemplate these questions to check your understanding:
                              </p>
                              <ul className="flex flex-col gap-2">
                                {activeProblem.selfCheck.map((q, idx) => (
                                  <li key={idx} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2 font-medium">
                                    <span className="text-slate-500 font-bold mt-0.5">?</span>
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Progress Controls */}
                        <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col gap-4">
                          {solvedProblems.includes(activeProblem.id) ? (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start gap-2.5 p-3.5 rounded-lg border bg-emerald-950/20 border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
                                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-slate-200">Lesson Completed!</span>
                                  <div className="text-slate-400 mt-0.5">You have read and mastered these study notes.</div>
                                </div>
                              </div>
                              {hasNextLesson() && (
                                <button
                                  onClick={handleNextLesson}
                                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                >
                                  Next Lesson
                                  <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={handleCompleteTheory}
                              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                            >
                              <BookOpen size={14} />
                              Mark as Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
