import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Layers className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Agent Engine Ready
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            FahiUX Multi-Agent Platform
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your project baseline is certified. The Manager, Requirement Analyst, Design Architect, Pre-Flight Auditor, TSX Coder, and Figma AI agents are loaded and ready.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">React 19 · Vite 6 · Tailwind v4</span>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            Start Phase 1
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
