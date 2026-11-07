import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  RefreshCw,
  X,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AssessmentHistory({ setSelectedAssessment, selectedAssessment }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [activeModalRecord, setActiveModalRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHistory(100);
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Sync modal with external selectedAssessment if provided
  useEffect(() => {
    if (selectedAssessment) {
      setActiveModalRecord(selectedAssessment);
    }
  }, [selectedAssessment]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete assessment record ${id}?`)) return;

    try {
      setDeletingId(id);
      await api.deleteHistoryItem(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (activeModalRecord?.id === id) setActiveModalRecord(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Wipe all assessment records from the SQLite database? This cannot be undone.')) return;

    try {
      setLoading(true);
      await api.clearAllHistory();
      setRecords([]);
      setActiveModalRecord(null);
    } catch (err) {
      alert(`Failed to clear records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'DemographicTag',
      'Age',
      'Glucose',
      'BloodPressure',
      'BMI',
      'ModelUsed',
      'RiskLevel',
      'ProbabilityPercentage',
    ];

    const rows = records.map((r) => [
      r.id,
      r.created_at,
      `"${r.demographic_tag || ''}"`,
      r.age,
      r.glucose,
      r.blood_pressure,
      r.bmi,
      `"${r.model_used}"`,
      `"${r.risk_level}"`,
      r.probability_percentage,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `glucocare_assessment_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.demographic_tag && r.demographic_tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk =
      riskFilter === 'ALL' || r.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner variant="info" />

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3.5">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or demographic tag..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter & Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="Low Risk">Low Risk</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>

            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              title="Download CSV export"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </button>

            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                title="Wipe database history"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Clear Registry
              </button>
            )}

            <button
              onClick={fetchHistory}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
            <p className="text-xs text-slate-500">Querying assessment records...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 text-xs space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto" />
            <p>{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No matching assessment records found</p>
            <p className="text-slate-400">Run a new assessment to log clinical telemetry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Subject Tag / ID</th>
                  <th className="py-3 px-4">Evaluation Date</th>
                  <th className="py-3 px-4">Vitals (Glucose • BMI • BP)</th>
                  <th className="py-3 px-4">Model Pipeline</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((record) => {
                  const badgeColor =
                    record.risk_level === 'High Risk'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : record.risk_level === 'Moderate Risk'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setActiveModalRecord(record)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{record.demographic_tag}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {record.id}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(record.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(record.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {record.glucose} mg/dL • BMI {record.bmi}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          BP: {record.blood_pressure} mmHg • Age: {record.age}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {record.model_used}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}
                        >
                          {record.risk_level} ({record.probability_percentage}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalRecord(record);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Inspect Parameters"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(record.id, e)}
                            disabled={deletingId === record.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {activeModalRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModalRecord(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModalRecord.demographic_tag}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {activeModalRecord.id} • {new Date(activeModalRecord.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Result Summary */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                activeModalRecord.risk_level === 'High Risk'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : activeModalRecord.risk_level === 'Moderate Risk'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div>
                <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                  Evaluated Tier
                </span>
                <span className="text-lg font-extrabold">{activeModalRecord.risk_level}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black">{activeModalRecord.probability_percentage}%</span>
                <span className="block text-[10px] uppercase font-bold opacity-75">Model Estimate</span>
              </div>
            </div>

            {/* Feature Values Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Evaluated Clinical Features
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(activeModalRecord.features || {}).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px] font-medium">{key}</span>
                    <span className="font-bold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Pipeline: {activeModalRecord.model_used}
              </span>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
