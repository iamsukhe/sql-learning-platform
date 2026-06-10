import React from 'react';
import { QueryResult, EvaluationResult } from '../utils/dbEngine';
import { Play, Database, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ResultsPanelProps {
  seedTables: { [tableName: string]: QueryResult };
  runResult: QueryResult | null;
  submissionResult: EvaluationResult | null;
  activeTab: 'input' | 'output' | 'tests';
  setActiveTab: (tab: 'input' | 'output' | 'tests') => void;
  isLoading: boolean;
}

function SqlTable({ result }: { result: QueryResult }) {
  if (result.error) {
    return (
      <div className="p-3.5 rounded border text-xs font-semibold flex items-center gap-2 bg-red-950/20 border-red-500/20 text-red-400">
        <AlertTriangle size={15} className="shrink-0" />
        <div>
          <strong>SQL error:</strong> {result.error}
        </div>
      </div>
    );
  }

  if (!result.columns || result.columns.length === 0) {
    return (
      <div className="p-4 text-center border border-dashed border-slate-800 rounded text-slate-500 text-xs">
        Empty result (0 columns, 0 rows)
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-800/80 rounded max-w-full">
      <table className="w-full border-collapse font-mono text-xs text-left">
        <thead>
          <tr className="bg-slate-900/80 border-b border-slate-800">
            {result.columns.map((col, i) => (
              <th key={i} className="text-slate-400 p-2.5 font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td colSpan={result.columns.length} className="text-center text-slate-500 italic p-4">
                No rows returned
              </td>
            </tr>
          ) : (
            result.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/10 border-b border-slate-900/60 last:border-b-0">
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-slate-200">
                    {val === null ? (
                      <span className="text-red-400 font-semibold text-[10px] bg-red-950/30 px-1 py-0.5 rounded border border-red-500/10">
                        NULL
                      </span>
                    ) : (
                      String(val)
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsPanel({
  seedTables,
  runResult,
  submissionResult,
  activeTab,
  setActiveTab,
  isLoading
}: ResultsPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Tabs list */}
      <div className="flex border-b border-slate-800 bg-slate-950/30 px-2 shrink-0">
        <button
          className={`px-4 py-2.5 font-semibold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all text-xs cursor-pointer ${activeTab === 'input' ? '!text-cyan-400 !border-cyan-500' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          Input Tables
        </button>
        <button
          className={`px-4 py-2.5 font-semibold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all text-xs cursor-pointer ${activeTab === 'output' ? '!text-cyan-400 !border-cyan-500' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Console Output
        </button>
        <button
          className={`px-4 py-2.5 font-semibold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all text-xs cursor-pointer ${activeTab === 'tests' ? '!text-cyan-400 !border-cyan-500' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          Test Cases {submissionResult && `(${submissionResult.testCases.filter(t => t.passed).length}/${submissionResult.testCases.length})`}
        </button>
      </div>

      {/* Tab panel contents */}
      <div className="p-4 flex-1 overflow-y-auto bg-slate-900/20">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-7 h-7 border-[3px] border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Running queries...</span>
          </div>
        )}

        {!isLoading && activeTab === 'input' && (
          <div className="flex flex-col gap-4">
            {Object.keys(seedTables).length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Loading seed database...
              </div>
            ) : (
              Object.entries(seedTables).map(([tableName, data]) => (
                <div key={tableName} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-300">
                    <Database size={13} className="text-cyan-400" />
                    <span>Table: {tableName}</span>
                  </div>
                  <SqlTable result={data} />
                </div>
              ))
            )}
          </div>
        )}

        {!isLoading && activeTab === 'output' && (
          <div className="h-full">
            {!runResult ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2.5 py-6">
                <Play size={28} className="text-slate-600" />
                <span className="text-xs text-slate-500">Run your SQL code to see the output here</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result Set</span>
                  {runResult.timeMs !== undefined && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Executed in {runResult.timeMs}ms
                    </span>
                  )}
                </div>
                <SqlTable result={runResult} />
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'tests' && (
          <div>
            {!submissionResult ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2.5 py-6">
                <CheckCircle2 size={28} className="text-slate-600" />
                <span className="text-xs text-slate-500">Submit your SQL code to evaluate against all test cases</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Status Summary */}
                <div 
                  className={`p-3.5 rounded border flex gap-3 text-xs ${submissionResult.success ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}
                >
                  {submissionResult.success ? (
                    <>
                      <CheckCircle2 size={18} className="shrink-0" />
                      <div>
                        <strong className="font-semibold text-slate-200">Success!</strong>
                        <div className="text-slate-400 mt-0.5">All test cases passed successfully. You can move to the next chapter!</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="shrink-0" />
                      <div>
                        <strong className="font-semibold text-slate-200">Wrong Answer</strong>
                        <div className="text-slate-400 mt-0.5">Some test cases failed. Review the results below to debug.</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Test Cases Accordion/List */}
                <div className="flex flex-col gap-2.5">
                  {submissionResult.testCases.map((tc, idx) => (
                    <div 
                      key={idx}
                      className="border border-slate-800 rounded bg-slate-950/10 overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 flex justify-between items-center bg-slate-950/40 border-b border-slate-900">
                        <span className="font-semibold text-xs text-slate-300">{tc.name}</span>
                        <div className="flex items-center gap-1.5">
                          {tc.passed ? (
                            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 size={13} /> Passed
                            </span>
                          ) : (
                            <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
                              <XCircle size={13} /> Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* If failed, show difference */}
                      {!tc.passed && (
                        <div className="p-4 bg-slate-950/20 flex flex-col gap-4">
                          {tc.error && (
                            <div className="text-xs text-red-400 font-medium px-3 py-2 bg-red-950/20 rounded border-l-3 border-red-500">
                              {tc.error}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            {/* User Output */}
                            <div className="flex flex-col gap-1.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Your Output</div>
                              <SqlTable result={tc.userResult} />
                            </div>

                            {/* Expected Output */}
                            <div className="flex flex-col gap-1.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expected Output</div>
                              <SqlTable result={tc.expectedResult} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
