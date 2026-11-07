import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './views/Dashboard';
import NewAssessment from './views/NewAssessment';
import PredictionResult from './views/PredictionResult';
import AssessmentHistory from './views/AssessmentHistory';
import ModelAnalytics from './views/ModelAnalytics';
import AboutMethodology from './views/AboutMethodology';
import api from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [bestModelName, setBestModelName] = useState('KNN Classifier');

  // Load metrics on start to determine active best model
  useEffect(() => {
    async function loadMeta() {
      try {
        const metrics = await api.getMetrics();
        if (metrics?.best_model) {
          setBestModelName(metrics.best_model);
        }
      } catch {
        // Fallback default
      }
    }
    loadMeta();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Topbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          setMobileOpen={setMobileOpen}
          bestModelName={bestModelName}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              setCurrentView={setCurrentView}
              setSelectedAssessment={setSelectedAssessment}
            />
          )}

          {currentView === 'new-assessment' && (
            <NewAssessment
              setCurrentView={setCurrentView}
              setLatestResult={setLatestResult}
            />
          )}

          {currentView === 'result' && (
            <PredictionResult
              result={latestResult}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'history' && (
            <AssessmentHistory
              selectedAssessment={selectedAssessment}
              setSelectedAssessment={setSelectedAssessment}
            />
          )}

          {currentView === 'analytics' && (
            <ModelAnalytics />
          )}

          {currentView === 'about' && (
            <AboutMethodology />
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 sm:px-8 border-t border-slate-200/80 bg-white/70 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">GlucoCare AI</span>
              <span>— Predictive Diabetes Screening Platform</span>
            </div>
            <div className="text-[11px] text-slate-400">
              For research and educational demonstration only. Not an FDA/CE cleared diagnostic medical device.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
