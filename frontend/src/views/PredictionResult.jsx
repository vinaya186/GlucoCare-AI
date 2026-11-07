import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  HeartPulse,
} from 'lucide-react';
import ProbabilityGauge from '../components/ProbabilityGauge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function PredictionResult({ result, setCurrentView }) {
  if (!result) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <Activity className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Assessment Result Available</h3>
        <p className="text-xs text-slate-500">Run a diagnostic assessment to view clinical predictions.</p>
        <button
          onClick={() => setCurrentView('new-assessment')}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  const {
    assessment_id,
    model_used,
    is_diabetic,
    probability_percentage = 0,
    risk_level = 'Low Risk',
    risk_color = 'green',
    recommendation,
    insights = [],
    disclaimer,
    input_data = {},
  } = result;

  const isHighRisk = risk_level === 'High Risk';
  const isModerateRisk = risk_level === 'Moderate Risk';

  const riskBannerStyles = isHighRisk
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : isModerateRisk
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900';

  const riskIcon = isHighRisk ? (
    <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
  ) : isModerateRisk ? (
    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
  ) : (
    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('new-assessment')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessment Form
        </button>

        <div className="flex items-center gap-2">
          {assessment_id && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-600 font-semibold">
              ID: {assessment_id}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[11px] text-teal-800 font-semibold border border-teal-200">
            Model: {model_used}
          </span>
        </div>
      </div>

      {/* Primary Result Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Gauge Column */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
            <ProbabilityGauge
              percentage={probability_percentage}
              riskLevel={risk_level}
              size={190}
            />
            <p className="text-[11px] text-slate-400 text-center mt-2 max-w-[200px]">
              Statistical algorithmic probability score (0–100%)
            </p>
          </div>

          {/* Classification & Summary Column */}
          <div className="md:col-span-2 space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${riskBannerStyles}`}>
              {riskIcon}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {risk_level} Classification
                  </h3>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/80">
                    {is_diabetic ? 'Positive Indicator' : 'Negative Indicator'}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {recommendation}
                </p>
              </div>
            </div>

            {/* Model Metadata Pill */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Preprocessing Pipeline:
              </span>
              <span className="font-semibold text-slate-800">
                Median Imputation + StandardScaler
              </span>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              <strong>Notice:</strong> This result represents the probability estimate returned by the trained model pipeline on the provided clinical features. It reflects population statistics rather than an individualized clinical diagnosis.
            </div>
          </div>
        </div>

        {/* Contributing Clinical Observations */}
        {insights.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Observational Physiological Factors
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((factor, idx) => {
                const borderStyle =
                  factor.severity === 'high'
                    ? 'border-rose-200 bg-rose-50/40 text-rose-950'
                    : factor.severity === 'moderate'
                    ? 'border-amber-200 bg-amber-50/40 text-amber-950'
                    : 'border-emerald-200 bg-emerald-50/40 text-emerald-950';

                return (
                  <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-1 ${borderStyle}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>{factor.feature}</span>
                      <span className="text-[11px] font-semibold">{factor.status}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">{factor.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Parameters Review Grid */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evaluated Input Parameters
            </h4>
            <span className="text-[11px] text-slate-400">8 Standard Features</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Glucose</span>
              <span className="text-sm font-bold text-slate-900">{input_data.glucose} mg/dL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Blood Pressure</span>
              <span className="text-sm font-bold text-slate-900">{input_data.blood_pressure} mmHg</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">BMI</span>
              <span className="text-sm font-bold text-slate-900">{input_data.bmi}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Age</span>
              <span className="text-sm font-bold text-slate-900">{input_data.age} yrs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Pregnancies</span>
              <span className="text-sm font-bold text-slate-900">{input_data.pregnancies}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Skin Fold</span>
              <span className="text-sm font-bold text-slate-900">{input_data.skin_thickness || '0 (Imputed)'} mm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Insulin</span>
              <span className="text-sm font-bold text-slate-900">{input_data.insulin || '0 (Imputed)'} µU/mL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Pedigree Score</span>
              <span className="text-sm font-bold text-slate-900">{input_data.diabetes_pedigree_function}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner variant="warning" />

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentView('history')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          View Assessment History
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('analytics')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Explore Model Analytics
          </button>
          <button
            onClick={() => setCurrentView('new-assessment')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Run Another Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
