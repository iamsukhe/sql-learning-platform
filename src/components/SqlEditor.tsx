import React, { useRef } from 'react';
import { Play, CheckSquare, RotateCcw, Code } from 'lucide-react';
import { TableSchema } from '../data/problems';

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  schemas: TableSchema[];
  isEvaluating: boolean;
}

export default function SqlEditor({
  value,
  onChange,
  onRun,
  onSubmit,
  onReset,
  schemas,
  isEvaluating
}: SqlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute line numbers
  const lines = value.split('\n');
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  // Handle Tab key insertion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // Reset selection position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Helper to insert suggestion at cursor
  const insertSuggestion = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);
    textarea.focus();

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  // Gather keywords for suggestions
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'LEFT JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'AS', 'AND', 'OR', 'MAX', 'COUNT'];
  const tableNames = schemas.map(s => s.name);
  const columnNames = Array.from(new Set(schemas.flatMap(s => s.columns.map(c => c.name))));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
        <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
          <Code size={16} className="text-cyan-400" />
          <span>SQL Editor</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-1 transition-colors cursor-pointer" 
            onClick={onReset}
            title="Reset code to default template"
          >
            <RotateCcw size={13} />
            Reset
          </button>
          
          <button 
            className="px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-1 transition-colors cursor-pointer" 
            onClick={onRun}
            disabled={isEvaluating}
          >
            <Play size={13} className="fill-current text-cyan-400" />
            Run Code
          </button>
          
          <button 
            className="px-3.5 py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1 transition-colors cursor-pointer" 
            onClick={onSubmit}
            disabled={isEvaluating}
          >
            <CheckSquare size={13} />
            {isEvaluating ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex flex-1 font-mono text-sm bg-slate-950/40 relative overflow-hidden">
        {/* Line Numbers */}
        <div className="py-4 px-3 text-right text-slate-600 bg-slate-900/40 border-r border-slate-800 select-none min-w-[42px]">
          {lineNumbers.map((num) => (
            <div key={num} className="h-[22.4px] leading-[22.4px] text-xs font-mono">{num}</div>
          ))}
        </div>
        
        {/* SQL Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 bg-transparent border-0 resize-none outline-none text-slate-200 leading-[22.4px] font-mono overflow-auto"
          spellCheck="false"
          placeholder="-- Write your SQL query here"
        />
      </div>

      {/* Autocomplete Helper chips bar (Func/Helpful design) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-1.5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Quick Suggestions:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
          {/* Tables */}
          {tableNames.map(name => (
            <button
              key={name}
              onClick={() => insertSuggestion(name)}
              className="text-[10px] bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 px-2 py-0.5 rounded cursor-pointer font-semibold hover:bg-cyan-950/80 transition-colors"
            >
              {name}
            </button>
          ))}
          {/* Columns */}
          {columnNames.map(col => (
            <button
              key={col}
              onClick={() => insertSuggestion(col)}
              className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              {col}
            </button>
          ))}
          {/* SQL Keywords */}
          {keywords.map(word => (
            <button
              key={word}
              onClick={() => insertSuggestion(word + ' ')}
              className="text-[10px] bg-slate-950 border border-slate-800 text-slate-500 px-2 py-0.5 rounded cursor-pointer font-mono hover:bg-slate-800 hover:text-slate-400 transition-colors"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
