import React from 'react';
import { TableSchema } from '../data/problems';
import { Database, Key, Link2 } from 'lucide-react';

interface SchemaViewerProps {
  schemas: TableSchema[];
}

export default function SchemaViewer({ schemas }: SchemaViewerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 min-h-[48px]">
        <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
          <Database size={16} className="text-cyan-400" />
          <span>Database Schema</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          SQLite
        </span>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {schemas.map((table) => (
          <div 
            key={table.name} 
            className="bg-slate-950/40 border border-slate-800 rounded-md overflow-hidden"
          >
            {/* Table Name */}
            <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <Database size={14} className="text-slate-400" />
              {table.name}
            </div>
            
            {/* Columns List */}
            <div className="flex flex-col">
              {table.columns.map((col) => (
                <div 
                  key={col.name} 
                  className="flex items-center justify-between px-3 py-2 border-b border-slate-900 last:border-b-0 text-xs text-slate-400 hover:bg-slate-900/20"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {col.key === 'PK' && (
                      <Key size={12} className="text-amber-500 fill-amber-500/10 shrink-0" />
                    )}
                    {col.key === 'FK' && (
                      <Link2 size={12} className="text-cyan-400 shrink-0" />
                    )}
                    {!col.key && <span className="w-3 shrink-0" />}
                    <span className={`truncate ${col.key ? 'font-semibold text-slate-200' : 'text-slate-300'}`}>
                      {col.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-slate-500">
                      {col.type}
                    </span>
                    {col.references && (
                      <span 
                        className="text-[9px] text-cyan-400 bg-cyan-950/30 px-1 py-0.5 rounded border border-cyan-500/20"
                        title={`References ${col.references}`}
                      >
                        → {col.references.split('.')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
