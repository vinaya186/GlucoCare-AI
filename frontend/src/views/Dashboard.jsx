import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

const RISK_COLORS = {
  'Low Risk': '#10b981',      // Emerald
  'Moderate Risk': '#f59e0b', // Amber
  'High Risk': '#e11d48',     // Rose
};

export default function Dashboard({ setCurrentView, setSelectedAssessment }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, historyData] = await Promise.all([
        api.getMetrics(),
        api.getHistory(50),
      ]);
      setMetrics(metricsData);
      setHistory(historyData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute distribution from real history
  const distributionData = [
    {
      name: 'Low Risk',
      value: history.filter((h) => h.risk_level === 'Low Risk').length,
      color: RISK_COLORS['Low Risk'],
    },
    {
      name: 'Moderate Risk',
      value: history.filter((h) => h.risk_level === 'Moderate Risk').length,
      color: RISK_COLORS['Moderate Risk'],
    },
    {
      name: 'High Risk',
      value: history.filter((h) => h.risk_level === 'High Risk').length,
      color: RISK_COLORS['High Risk'],
    },
  ];

  const totalAssessed = history.length;
  const highRiskCount = history.filter((h) => h.risk_level === 'High Risk').length;
  const lowRiskCount = history.filter((h) => h.risk_level === 'Low Risk').length;

  // Prepare model comparison chart data
  const modelComparisonData = metrics?.models
    ? Object.entries(metrics.models).map(([name, data]) => ({
        name: name === 'Support Vector Machine' ? 'SVM' : name,
        Accuracy: Math.round(data.accuracy * 100),
        Recall: Math.round(data.recall * 100),
        Precision: Math.round(data.precision * 100),
        F1: Math.round(data.f1_score * 100),
      }))
    : [];

  // Prepare feature importance data (prefers Gradient Boosting, falls back to Random Forest)
  const featSource = metrics?.feature_importance_gb || metrics?.feature_importance_rf;
  const featureImportanceData = featSource
    ? Object.entries(featSource)
        .map(([feature, val]) => ({
          feature: feature.replace(/([A-Z])/g, ' $1').trim(),
          importance: Math.round(val * 100),
        }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading clinical metrics and recent data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Service Communication Error</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <DisclaimerBanner variant="info" />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Screenings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assessments</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalAssessed}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-600" /> Demo SQLite registry
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: High Risk Flagged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Cases</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{highRiskCount}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Probability &gt; 60%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Low Risk Screenings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Risk Cases</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{lowRiskCount}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Probability &lt; 35%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Best Model Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Model</p>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[170px]" title={metrics?.best_model}>
              {metrics?.best_model || 'Logistic Regression (Balanced)'}
            </h3>
            <p className="text-xs text-teal-700 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              {metrics?.models?.[metrics?.best_model]?.cv_roc_auc_mean
                ? `CV ROC-AUC: ${(metrics.models[metrics.best_model].cv_roc_auc_mean).toFixed(3)}`
                : 'Highest Sensitivity'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Performance Comparison */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Validated Model Benchmark</h3>
              <p className="text-xs text-slate-500">Holdout test set comparison across trained classifiers (%)</p>
            </div>
            <button
              onClick={() => setCurrentView('analytics')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Full Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Accuracy" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screening Risk Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Risk Stratification Ratio</h3>
            <p className="text-xs text-slate-500">Categorization across logged assessments</p>
          </div>

          <div className="h-52 w-full my-auto">
            {totalAssessed > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} assessments`, name]}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-xs text-slate-400">No assessments logged yet.</p>
                <button
                  onClick={() => setCurrentView('new-assessment')}
                  className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
                >
                  Run your first assessment
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="block font-bold text-emerald-600">{lowRiskCount}</span>
              <span className="text-[11px] text-slate-400">Low</span>
            </div>
            <div>
              <span className="block font-bold text-amber-600">
                {history.filter((h) => h.risk_level === 'Moderate Risk').length}
              </span>
              <span className="text-[11px] text-slate-400">Moderate</span>
            </div>
            <div>
              <span className="block font-bold text-rose-600">{highRiskCount}</span>
              <span className="text-[11px] text-slate-400">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Impact & Recent History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Preview */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Key Physiological Determinants</h3>
              <p className="text-xs text-slate-500">Relative feature weights computed by Random Forest</p>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Gini Impurity
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {featureImportanceData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{item.feature}</span>
                  <span className="text-teal-700 font-semibold">{item.importance}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(item.importance * 3, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assessment Stream */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Assessments</h3>
              <p className="text-xs text-slate-500">Latest non-PHI screening runs</p>
            </div>
            <button
              onClick={() => setCurrentView('history')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {history.slice(0, 4).map((record) => {
                const badgeColor =
                  record.risk_level === 'High Risk'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : record.risk_level === 'Moderate Risk'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                return (
                  <div
                    key={record.id}
                    onClick={() => {
                      if (setSelectedAssessment) setSelectedAssessment(record);
                      setCurrentView('history');
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/70 -mx-2 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{record.demographic_tag}</span>
                        <span className="text-[11px] text-slate-400">ID: {record.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Age: {record.age} • Glucose: {record.glucose} mg/dL • BMI: {record.bmi}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badgeColor}`}>
                        {record.risk_level} ({record.probability_percentage}%)
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent records found in the SQLite database.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ready to evaluate a new subject?</span>
            <button
              onClick={() => setCurrentView('new-assessment')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
