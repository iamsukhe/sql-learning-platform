"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Sun, Moon, Database, HelpCircle, AlertTriangle, ArrowRight, CheckCircle2, BookOpen, Menu } from 'lucide-react';
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

export default function Home() {
  const [activeView, setActiveView] = useState<'notes' | 'sql'>('notes');
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



  const activeProblem = problems.find(p => p.id === currentProblemId) || problems[0];

  // 1. Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('leetsql-theme') as 'dark' | 'light' || 'dark';
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
    localStorage.setItem('leetsql-theme', nextTheme);
  };

  // 2. Load progress from localStorage
  useEffect(() => {
    const solved = localStorage.getItem('leetsql-solved');
    const savedCodes = localStorage.getItem('leetsql-codes');
    
    const timer = setTimeout(() => {
      if (solved) {
        setSolvedProblems(JSON.parse(solved));
      }
      if (savedCodes) {
        setUserCodes(JSON.parse(savedCodes));
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
    localStorage.setItem('leetsql-codes', JSON.stringify(nextCodes));
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
      localStorage.setItem('leetsql-solved', JSON.stringify(nextSolved));
    }
  };

  const handleSelectProblem = (id: string) => {
    setCurrentProblemId(id);
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
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/);
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
      return part;
    });
  };

  const renderDescription = (desc: string) => {
    const lines = desc.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTableHeaders: string[] | null = null;
    let currentTableRows: string[][] = [];
    let isInsideTable = false;

    const renderAccumulatedTable = (key: string | number) => {
      if (!isInsideTable) return null;
      isInsideTable = false;
      const headers = currentTableHeaders;
      const rows = currentTableRows;
      currentTableHeaders = null;
      currentTableRows = [];

      return (
        <div key={key} className="overflow-x-auto border border-slate-800 rounded my-4 max-w-full">
          <table className="w-full border-collapse text-xs text-left">
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

      if (trimmed.startsWith('|')) {
        isInsideTable = true;
        if (trimmed.includes(':---') || trimmed.match(/^\|[\s:-|]+$/)) {
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

        if (trimmed.startsWith('### ')) {
          elements.push(
            <h4 key={i} className="mt-5 mb-2.5 text-slate-200 text-sm font-semibold tracking-wide border-b border-slate-800/40 pb-1">
              {parseInlineCode(trimmed.slice(4))}
            </h4>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h3 key={i} className="mt-6 mb-3 text-slate-100 text-base font-bold tracking-tight border-b border-slate-800 pb-1.5">
              {parseInlineCode(trimmed.slice(3))}
            </h3>
          );
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h2 key={i} className="mt-8 mb-4 text-slate-100 text-lg font-extrabold tracking-tight border-b border-slate-800 pb-2">
              {parseInlineCode(trimmed.slice(2))}
            </h2>
          );
        } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          elements.push(
            <h4 key={i} className="mt-4 mb-2 text-slate-200 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {parseInlineCode(trimmed.slice(2, -2))}
            </h4>
          );
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          elements.push(
            <li key={i} className="ml-4 mb-1.5 text-slate-400 text-xs list-disc leading-relaxed pl-1.5">
              {parseInlineCode(trimmed.slice(1).trim())}
            </li>
          );
        } else if (trimmed.match(/^\d+\.\s/)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          const num = match ? match[1] : '1';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-2 mb-2 text-slate-400 text-xs leading-relaxed flex items-start gap-2">
              <span className="text-cyan-500 font-semibold font-mono">{num}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else if (trimmed.match(/^[a-zA-Z]\.\s/)) {
          const match = trimmed.match(/^([a-zA-Z])\.\s(.*)/);
          const char = match ? match[1] : 'a';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-6 mb-1.5 text-slate-400 text-xs leading-relaxed flex items-start gap-2">
              <span className="text-slate-500 font-semibold font-mono">{char}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else if (trimmed.match(/^[ivxIVX]+\.\s/)) {
          const match = trimmed.match(/^([ivxIVX]+)\.\s(.*)/);
          const roman = match ? match[1] : 'i';
          const content = match ? match[2] : trimmed;
          elements.push(
            <div key={i} className="ml-10 mb-1.5 text-slate-500 text-xs leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 font-mono">{roman}.</span>
              <span className="flex-1">{parseInlineCode(content)}</span>
            </div>
          );
        } else {
          elements.push(
            <p key={i} className="mb-3 text-slate-400 text-xs leading-relaxed">
              {parseInlineCode(trimmed)}
            </p>
          );
        }
      }
    }

    if (isInsideTable) {
      elements.push(renderAccumulatedTable(`table-end`));
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
            <span>Leet<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">SQL</span></span>
          </div>
        </div>

        {/* Navigation Tabs (Notes vs SQL Practice) */}
        <div className="flex bg-slate-950/80 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveView('notes')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
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
            onClick={() => setActiveView('sql')}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeView === 'sql'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.2)] font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={13} />
            <span className="hidden sm:inline">SQL Problems</span>
            <span className="sm:hidden">SQL</span>
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
          <PdfViewer pdfUrl="/Full Notes.pdf" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-full w-full overflow-hidden relative">
            {/* Sidebar */}
            <Sidebar
              problems={problems}
              currentProblemId={currentProblemId}
              solvedProblems={solvedProblems}
              onSelectProblem={handleSelectProblem}
              isOpen={isSidebarOpen}
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
              <div className="flex flex-col gap-4 p-3 h-full overflow-y-auto pb-12 bg-slate-950/20 w-full lg:grid lg:grid-cols-[1fr_1.25fr] lg:overflow-hidden lg:p-4 lg:pb-4">
                
                {/* Coding Sandbox Workspace */}
                {activeProblem.type === 'coding' && (
                  <>
                    {/* Left Column: Description & Schema */}
                    <div className="flex flex-col gap-4 h-auto lg:h-full lg:overflow-hidden shrink-0 lg:shrink">
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
                      </div>

                      {/* Schema Viewer Panel */}
                      <div className="h-auto max-h-[300px] lg:max-h-none lg:h-full shrink-0 lg:shrink">
                        <SchemaViewer schemas={activeProblem.schema || []} />
                      </div>
                    </div>

                    {/* Right Column: SQL Editor & Output */}
                    <div className="flex flex-col gap-4 h-auto lg:h-full lg:overflow-hidden shrink-0 lg:shrink">
                      {/* Code Editor Panel */}
                      <div className="flex-1 min-h-[300px] lg:min-h-0 overflow-hidden shrink-0 lg:shrink">
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

                      {/* Results Panel */}
                      <div className="flex-1 min-h-[250px] lg:min-h-0 overflow-hidden shrink-0 lg:shrink">
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
                  <div className="col-span-2 grid grid-cols-[1.5fr_1fr] gap-4 h-full overflow-hidden">
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
