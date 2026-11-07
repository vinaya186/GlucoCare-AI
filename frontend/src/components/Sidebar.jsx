import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  History,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

export default function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const checkStatus = async () => {
    try {
      setBackendStatus('checking');
      await api.getHealth();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-assessment', label: 'New Assessment', icon: Activity, badge: 'Live' },
    { id: 'history', label: 'Assessment History', icon: History },
    { id: 'analytics', label: 'Model Analytics', icon: BarChart3 },
    { id: 'about', label: 'About & Methodology', icon: FileText },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  GlucoCare<span className="text-teal-600">.AI</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  Clinical Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative
                  ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-sm shadow-teal-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-teal-100 text-teal-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status & Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> API Engine
                </span>
                <button
                  onClick={checkStatus}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3 h-3 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus === 'online'
                      ? 'bg-emerald-500 animate-pulse'
                      : backendStatus === 'checking'
                      ? 'bg-amber-400 animate-bounce'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-slate-600 capitalize">
                  {backendStatus === 'online'
                    ? 'FastAPI Operational'
                    : backendStatus === 'checking'
                    ? 'Verifying service...'
                    : 'Backend Disconnected'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2" title={`API: ${backendStatus}`}>
              <span
                className={`w-3 h-3 rounded-full ${
                  backendStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
          )}

          {!isCollapsed && (
            <div className="px-2 pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>GlucoCare AI v1.0.0</span>
              <span className="text-slate-500">Pima Cohort</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
