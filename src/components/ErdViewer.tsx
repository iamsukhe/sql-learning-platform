import React from 'react';

interface ErdViewerProps {
  type: 'basic' | 'strong-weak' | 'attributes' | 'relationships';
}

export default function ErdViewer({ type }: ErdViewerProps) {
  if (type === 'basic') {
    return (
      <div className="w-full border border-slate-800 bg-slate-950/40 rounded-xl p-4 my-6 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase mb-3 self-start">Entity-Relationship Diagram Example</div>
        <div className="w-full overflow-x-auto flex justify-center">
          <svg width="600" height="220" viewBox="0 0 600 220" className="max-w-full font-sans select-none shrink-0">
            {/* Definitions for Glow/Shadow Effects */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Lines */}
            {/* User to Attributes */}
            <line x1="100" y1="55" x2="100" y2="90" stroke="#334155" strokeWidth="1.5" />
            <line x1="40" y1="162" x2="75" y2="112" stroke="#334155" strokeWidth="1.5" />
            <line x1="160" y1="162" x2="125" y2="112" stroke="#334155" strokeWidth="1.5" />
            
            {/* Workout to Attributes */}
            <line x1="500" y1="55" x2="500" y2="90" stroke="#334155" strokeWidth="1.5" />
            <line x1="550" y1="162" x2="515" y2="112" stroke="#334155" strokeWidth="1.5" />

            {/* Main Entity Connections */}
            <line x1="150" y1="112.5" x2="250" y2="112.5" stroke="#1e293b" strokeWidth="3" />
            <line x1="150" y1="112.5" x2="250" y2="112.5" stroke="#3b82f6" strokeWidth="1.5" />
            <line x1="350" y1="112.5" x2="450" y2="112.5" stroke="#1e293b" strokeWidth="3" />
            <line x1="350" y1="112.5" x2="450" y2="112.5" stroke="#3b82f6" strokeWidth="1.5" />

            {/* User Entity */}
            <rect x="50" y="90" width="100" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)" />
            <text x="100" y="117.5" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">User</text>

            {/* Workout Entity */}
            <rect x="450" y="90" width="100" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)" />
            <text x="500" y="117.5" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">Workout</text>

            {/* Performs Relationship */}
            <polygon points="300,75 350,112.5 300,150 250,112.5" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
            <text x="300" y="116.5" fill="#93c5fd" textAnchor="middle" className="text-[10px] font-bold tracking-wider font-sans">PERFORMS</text>

            {/* User ID Key Attribute (Underlined text) */}
            <ellipse cx="100" cy="35" rx="45" ry="20" fill="#020617" stroke="#0891b2" strokeWidth="1.5" />
            <text x="100" y="38" fill="#22d3ee" textAnchor="middle" className="text-[10px] font-sans font-semibold underline">UserID</text>

            {/* User Name Attribute */}
            <ellipse cx="40" cy="180" rx="35" ry="18" fill="#020617" stroke="#0891b2" strokeWidth="1.5" />
            <text x="40" y="183.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">Name</text>

            {/* User Email Attribute */}
            <ellipse cx="160" cy="180" rx="35" ry="18" fill="#020617" stroke="#0891b2" strokeWidth="1.5" />
            <text x="160" y="183.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">Email</text>

            {/* Workout ID Key Attribute */}
            <ellipse cx="500" cy="35" rx="45" ry="20" fill="#020617" stroke="#0891b2" strokeWidth="1.5" />
            <text x="500" y="38" fill="#22d3ee" textAnchor="middle" className="text-[10px] font-sans font-semibold underline">WorkoutID</text>

            {/* Workout Duration Attribute */}
            <ellipse cx="550" cy="180" rx="40" ry="18" fill="#020617" stroke="#0891b2" strokeWidth="1.5" />
            <text x="550" y="183.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">Duration</text>
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'strong-weak') {
    return (
      <div className="w-full border border-slate-800 bg-slate-950/40 rounded-xl p-4 my-6 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mb-3 self-start">Strong vs. Weak Entities</div>
        <div className="w-full overflow-x-auto flex justify-center">
          <svg width="600" height="200" viewBox="0 0 600 200" className="max-w-full font-sans select-none shrink-0">
            {/* Connections */}
            <line x1="180" y1="100" x2="250" y2="100" stroke="#334155" strokeWidth="2" />
            
            {/* Double Line connection to weak entity (identifying path) */}
            <line x1="350" y1="97" x2="420" y2="97" stroke="#10b981" strokeWidth="1.5" />
            <line x1="350" y1="103" x2="420" y2="103" stroke="#10b981" strokeWidth="1.5" />

            {/* Labels */}
            <text x="125" y="45" fill="#94a3b8" textAnchor="middle" className="text-[10px] font-sans tracking-wide">Strong Entity</text>
            <text x="125" y="60" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans font-medium">(Exists Independently)</text>
            
            <text x="475" y="45" fill="#94a3b8" textAnchor="middle" className="text-[10px] font-sans tracking-wide">Weak Entity</text>
            <text x="475" y="60" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans font-medium">(Dependent on Strong Entity)</text>

            {/* User (Strong Entity) */}
            <rect x="70" y="77.5" width="110" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="125" y="105" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">User</text>

            {/* Has (Identifying Relationship) - Double Diamond */}
            <polygon points="300,60 350,100 300,140 250,100" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <polygon points="300,65 344,100 300,135 256,100" fill="none" stroke="#10b981" strokeWidth="1" />
            <text x="300" y="103.5" fill="#a7f3d0" textAnchor="middle" className="text-[9px] font-bold tracking-wider font-sans">HAS</text>

            {/* Goal (Weak Entity) - Double Rectangle */}
            <rect x="420" y="77.5" width="110" height="45" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <rect x="424" y="81.5" width="102" height="37" rx="6" fill="none" stroke="#10b981" strokeWidth="1" />
            <text x="475" y="105" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">Goal</text>
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'attributes') {
    return (
      <div className="w-full border border-slate-800 bg-slate-950/40 rounded-xl p-4 my-6 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] text-purple-400 font-bold tracking-wider uppercase mb-3 self-start">ERD Attribute Types & Symbols</div>
        <div className="w-full overflow-x-auto flex justify-center">
          <svg width="600" height="240" viewBox="0 0 600 240" className="max-w-full font-sans select-none shrink-0">
            {/* Attribute lines connecting to Entity */}
            <line x1="95" y1="65" x2="240" y2="120" stroke="#334155" strokeWidth="1.5" />
            <line x1="505" y1="65" x2="360" y2="120" stroke="#334155" strokeWidth="1.5" />
            <line x1="95" y1="175" x2="240" y2="120" stroke="#334155" strokeWidth="1.5" />
            <line x1="505" y1="175" x2="360" y2="120" stroke="#334155" strokeWidth="1.5" />

            {/* Composite sub-branches */}
            <line x1="95" y1="193" x2="50" y2="215" stroke="#475569" strokeWidth="1" />
            <line x1="95" y1="193" x2="140" y2="215" stroke="#475569" strokeWidth="1" />

            {/* Central Entity */}
            <rect x="240" y="97.5" width="120" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="300" y="125" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">User</text>

            {/* Key Attribute (Underlined) */}
            <ellipse cx="95" cy="45" rx="45" ry="20" fill="#020617" stroke="#a855f7" strokeWidth="1.5" />
            <text x="95" y="48.5" fill="#c084fc" textAnchor="middle" className="text-[10px] font-sans font-semibold underline">UserID</text>
            <text x="95" y="15" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">Key (Unique)</text>

            {/* Multivalued Attribute (Double Ellipse) */}
            <ellipse cx="505" cy="45" rx="45" ry="20" fill="#020617" stroke="#a855f7" strokeWidth="1.5" />
            <ellipse cx="501" cy="45" rx="41" ry="17" fill="none" stroke="#a855f7" strokeWidth="1" />
            <text x="505" y="48.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">Phones</text>
            <text x="505" y="15" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">Multivalued (Multiple values)</text>

            {/* Composite Attribute (Branches out) */}
            <ellipse cx="95" cy="175" rx="45" ry="20" fill="#020617" stroke="#a855f7" strokeWidth="1.5" />
            <text x="95" y="178.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">FullName</text>
            <text x="95" y="145" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">Composite (Has Sub-parts)</text>

            {/* Composite Sub-parts */}
            <ellipse cx="50" cy="223" rx="35" ry="14" fill="#020617" stroke="#475569" strokeWidth="1" />
            <text x="50" y="226" fill="#94a3b8" textAnchor="middle" className="text-[8px] font-sans">First</text>

            <ellipse cx="140" cy="223" rx="35" ry="14" fill="#020617" stroke="#475569" strokeWidth="1" />
            <text x="140" y="226" fill="#94a3b8" textAnchor="middle" className="text-[8px] font-sans">Last</text>

            {/* Derived Attribute (Dashed border) */}
            <ellipse cx="505" cy="175" rx="45" ry="20" fill="#020617" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x="505" y="178.5" fill="#e2e8f0" textAnchor="middle" className="text-[10px] font-sans">Age</text>
            <text x="505" y="145" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">Derived (Calculated)</text>
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'relationships') {
    return (
      <div className="w-full border border-slate-800 bg-slate-950/40 rounded-xl p-4 my-6 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] text-blue-400 font-bold tracking-wider uppercase mb-3 self-start">Relationship Cardinalities (1:1 & 1:N)</div>
        <div className="w-full overflow-x-auto flex justify-center">
          <svg width="600" height="220" viewBox="0 0 600 220" className="max-w-full font-sans select-none shrink-0">
            {/* Connections */}
            {/* User to Performs */}
            <line x1="140" y1="102" x2="250" y2="52.5" stroke="#334155" strokeWidth="1.5" />
            {/* Performs to Workout */}
            <line x1="350" y1="52.5" x2="460" y2="52.5" stroke="#3b82f6" strokeWidth="1.5" />

            {/* User to Has */}
            <line x1="140" y1="118" x2="250" y2="167.5" stroke="#334155" strokeWidth="1.5" />
            {/* Has to Goal */}
            <line x1="350" y1="167.5" x2="460" y2="167.5" stroke="#3b82f6" strokeWidth="1.5" />

            {/* Cardinality labels */}
            <text x="160" y="85" fill="#38bdf8" className="text-[11px] font-bold font-mono">1</text>
            <text x="440" y="45" fill="#38bdf8" className="text-[11px] font-bold font-mono">N</text>

            <text x="160" y="145" fill="#38bdf8" className="text-[11px] font-bold font-mono">1</text>
            <text x="440" y="160" fill="#38bdf8" className="text-[11px] font-bold font-mono">1</text>

            {/* Entity User */}
            <rect x="40" y="87.5" width="100" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="90" y="115" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">User</text>

            {/* Entity Workout */}
            <rect x="460" y="30" width="100" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="510" y="57.5" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">Workout</text>

            {/* Entity Goal */}
            <rect x="460" y="145" width="100" height="45" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="510" y="172.5" fill="#f8fafc" textAnchor="middle" className="text-xs font-bold font-sans">Goal</text>

            {/* Performs Relationship (1:N) */}
            <polygon points="300,22.5 350,52.5 300,82.5 250,52.5" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="300" y="55.5" fill="#93c5fd" textAnchor="middle" className="text-[8px] font-bold tracking-wider font-sans">PERFORMS</text>
            <text x="300" y="105" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">One-to-Many (1:N)</text>

            {/* Has Relationship (1:1) */}
            <polygon points="300,137.5 350,167.5 300,197.5 250,167.5" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="300" y="170.5" fill="#93c5fd" textAnchor="middle" className="text-[8px] font-bold tracking-wider font-sans">HAS</text>
            <text x="300" y="215" fill="#64748b" textAnchor="middle" className="text-[8px] font-sans">One-to-One (1:1)</text>
          </svg>
        </div>
      </div>
    );
  }

  return null;
}
