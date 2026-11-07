import React from 'react';
import { Menu, Activity, Sparkles } from 'lucide-react';

export default function Topbar({
  currentView,
  setCurrentView,
  setMobileOpen,
  bestModelName = 'KNN Classifier',
}) {
  const titles = {
    'dashboard': { title: 'Clinical Overview & Telemetry', subtitle: 'Population metrics and real-time screening distribution' },
    'new-assessment': { title: 'New Diagnostic Assessment', subtitle: 'Enter patient metabolic indicators for algorithmic risk estimation' },
    'result': { title: 'Assessment Result Analysis', subtitle: 'Probability breakdown, risk tier, and clinical observations' },
    'history': { title: 'Assessment Registry', subtitle: 'Recent screening history and demo log audit' },
    'analytics': { title: 'Model Performance & Benchmark', subtitle: 'Comparative validation metrics, confusion matrices & feature impact' },
    'about': { title: 'Methodology & Data Provenance', subtitle: 'Dataset attributes, clinical context, and algorithmic architecture' },
  };

  const current = titles[currentView] || { title: 'GlucoCare AI', subtitle: 'Healthcare Intelligence System' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate font-normal">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Active Pipeline: <strong className="text-slate-900 font-semibold">{bestModelName}</strong></span>
        </div>

        {currentView !== 'new-assessment' && (
          <button
            onClick={() => setCurrentView('new-assessment')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 transition-all active:scale-[0.98]"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden xs:inline">Run Assessment</span>
          </button>
        )}
      </div>
    </header>
  );
}
