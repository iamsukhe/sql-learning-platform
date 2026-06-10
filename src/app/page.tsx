"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Sun, Moon, Database, HelpCircle, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
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

export default function Home() {
  const [currentProblemId, setCurrentProblemId] = useState<string>(problems[0].id);
  const [userCodes, setUserCodes] = useState<{ [problemId: string]: string }>({});
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [seedTables, setSeedTables] = useState<{ [tableName: string]: QueryResult }>({});
  const [loadingTables, setLoadingTables] = useState(false);
  
  const [runResult, setRunResult] = useState<QueryResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'tests'>('input');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // MCQ-specific states
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);
  const [mcqPassed, setMcqPassed] = useState<boolean>(false);

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

  // MCQ submit handler
  const handleSubmitMcq = () => {
    if (selectedOptionIndex === null) return;
    
    const isCorrect = selectedOptionIndex === activeProblem.correctOptionIndex;
    setMcqPassed(isCorrect);
    setMcqSubmitted(true);
    
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });
      markProblemSolved(currentProblemId);
    }
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
    
    // Reset coding states
    setRunResult(null);
    setSubmissionResult(null);
    setActiveTab('input');
    
    // Reset MCQ states
    setSelectedOptionIndex(null);
    setMcqSubmitted(false);
    setMcqPassed(false);
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
  const parseInlineCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={idx} 
            className="bg-slate-950 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderDescription = (desc: string) => {
    return desc.split('\n').map((line, idx) => {
      if (line.trim().startsWith('-')) {
        return (
          <li key={idx} className="ml-4 mb-2 text-slate-400 text-xs">
            {parseInlineCode(line.trim().slice(1).trim())}
          </li>
        );
      }
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <h4 key={idx} className="mt-4 mb-2 text-slate-200 text-xs font-semibold">
            {parseInlineCode(line.trim().replace(/\*\*/g, ''))}
          </h4>
        );
      }
      return (
        <p key={idx} className="mb-3 text-slate-400 text-xs leading-relaxed">
          {parseInlineCode(line)}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-rows-[56px_1fr] h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 z-10 select-none">
        <div className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-100">
          <Database size={20} className="text-cyan-400" />
          <span>Leet<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">SQL</span></span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs font-semibold">
            <Sparkles size={14} className="text-cyan-400" />
            <span>{solvedProblems.length} / {problems.length} Completed</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors cursor-pointer" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="grid grid-cols-[280px_1fr] h-full w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          problems={problems}
          currentProblemId={currentProblemId}
          solvedProblems={solvedProblems}
          onSelectProblem={handleSelectProblem}
        />

        {/* Workspace Panel */}
        {!isDbLoaded ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full bg-slate-950/40">
            <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading Database Engine...</p>
          </div>
        ) : dbError ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full bg-slate-950/40">
            <AlertTriangle size={44} className="text-red-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-200">Database Engine Error</h2>
            <p className="text-xs text-slate-400 max-w-[380px] leading-relaxed">{dbError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_1.25fr] gap-4 p-4 h-full overflow-hidden bg-slate-950/20">
            
            {/* Coding Sandbox Workspace */}
            {activeProblem.type === 'coding' && (
              <>
                {/* Left Column: Description & Schema */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                  {/* Problem Description Panel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                      <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                        <HelpCircle size={16} className="text-cyan-400" />
                        <span>{activeProblem.title}</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                      {renderDescription(activeProblem.description)}
                    </div>
                  </div>

                  {/* Schema Viewer Panel */}
                  <div className="h-full overflow-hidden">
                    <SchemaViewer schemas={activeProblem.schema || []} />
                  </div>
                </div>

                {/* Right Column: SQL Editor & Output */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                  {/* Code Editor Panel */}
                  <div className="flex-1 overflow-hidden">
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
                  <div className="flex-1 overflow-hidden">
                    <ResultsPanel
                      seedTables={seedTables}
                      runResult={runResult}
                      submissionResult={submissionResult}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      isLoading={loadingTables || isEvaluating}
                    />
                  </div>
                </div>
              </>
            )}

            {/* MCQ Conceptual Workspace */}
            {activeProblem.type === 'mcq' && (
              <div className="col-span-2 grid grid-cols-[1fr_1.25fr] gap-4 h-full overflow-hidden">
                {/* Left Column: Reading Content */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                    <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                      <HelpCircle size={16} className="text-cyan-400" />
                      <span>{activeProblem.title} - Concept</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                      CONCEPT
                    </span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    {renderDescription(activeProblem.description)}
                  </div>
                </div>

                {/* Right Column: Interactive Quiz Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
                    <span className="font-semibold text-slate-200 text-sm">Concept Check</span>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-4">{activeProblem.question}</h3>
                      <div className="flex flex-col gap-3">
                        {activeProblem.options?.map((option, idx) => {
                          const isSelected = selectedOptionIndex === idx;
                          const isCorrectOption = idx === activeProblem.correctOptionIndex;
                          
                          let cardClass = "p-4 rounded-lg border text-left text-xs transition-all cursor-pointer ";
                          if (mcqSubmitted) {
                            if (isCorrectOption) {
                              cardClass += "bg-emerald-950/20 border-emerald-500/30 text-emerald-300";
                            } else if (isSelected) {
                              cardClass += "bg-rose-950/20 border-rose-500/30 text-rose-300";
                            } else {
                              cardClass += "bg-slate-950/40 border-slate-800/80 text-slate-500 cursor-default";
                            }
                          } else {
                            if (isSelected) {
                              cardClass += "bg-cyan-950/30 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.1)]";
                            } else {
                              cardClass += "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40";
                            }
                          }
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => !mcqSubmitted && setSelectedOptionIndex(idx)}
                              disabled={mcqSubmitted}
                              className={cardClass}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="leading-relaxed">{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col gap-4">
                      {mcqSubmitted && (
                        <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed ${
                          mcqPassed 
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                        }`}>
                          {mcqPassed ? (
                            <>
                              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold">Correct!</span> Well done. You&apos;ve mastered this concept.
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold">Incorrect.</span> Try again to find the correct answer.
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        {!mcqSubmitted ? (
                          <button
                            onClick={handleSubmitMcq}
                            disabled={selectedOptionIndex === null}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <>
                            {!mcqPassed && (
                              <button
                                onClick={() => {
                                  setMcqSubmitted(false);
                                  setSelectedOptionIndex(null);
                                }}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded font-semibold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                              >
                                Try Again
                              </button>
                            )}
                            {hasNextLesson() && (
                              <button
                                onClick={handleNextLesson}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                Next Lesson
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
