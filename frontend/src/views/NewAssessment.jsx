import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Info,
  AlertCircle,
  RotateCcw,
  Send,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function NewAssessment({ setCurrentView, setLatestResult }) {
  const [formData, setFormData] = useState({
    pregnancies: 1,
    glucose: 120,
    blood_pressure: 72,
    skin_thickness: 25,
    insulin: 85,
    bmi: 27.5,
    diabetes_pedigree_function: 0.35,
    age: 38,
    model_name: 'best',
    demographic_tag: 'Screening Subject #1',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Field configurations with physiological units & reference ranges
  const fields = [
    {
      name: 'glucose',
      label: 'Plasma Fasting Glucose',
      unit: 'mg/dL',
      helper: 'Normal: 70–99 | Impaired: 100–125 | Diabetic: ≥126',
      min: 0,
      max: 400,
      step: 1,
      required: true,
    },
    {
      name: 'blood_pressure',
      label: 'Diastolic Blood Pressure',
      unit: 'mmHg',
      helper: 'Normal: <80 | Stage 1: 80–89 | Stage 2: ≥90',
      min: 0,
      max: 200,
      step: 1,
      required: true,
    },
    {
      name: 'bmi',
      label: 'Body Mass Index (BMI)',
      unit: 'kg/m²',
      helper: 'Healthy: 18.5–24.9 | Overweight: 25–29.9 | Obese: ≥30',
      min: 10,
      max: 70,
      step: 0.1,
      required: true,
    },
    {
      name: 'age',
      label: 'Age',
      unit: 'years',
      helper: 'Risk increases with age, particularly above 45',
      min: 1,
      max: 120,
      step: 1,
      required: true,
    },
    {
      name: 'pregnancies',
      label: 'Number of Pregnancies',
      unit: 'count',
      helper: 'Enter 0 for biological males or nulliparous individuals',
      min: 0,
      max: 20,
      step: 1,
      required: true,
    },
    {
      name: 'skin_thickness',
      label: 'Triceps Skin Fold',
      unit: 'mm',
      helper: 'Indicator of subcutaneous adipose tissue (0 if unmeasured)',
      min: 0,
      max: 100,
      step: 1,
      required: false,
    },
    {
      name: 'insulin',
      label: '2-Hour Serum Insulin',
      unit: 'µU/mL',
      helper: 'Normal fasting: 2–20 | Postprandial: up to 150 (0 if unmeasured)',
      min: 0,
      max: 900,
      step: 1,
      required: false,
    },
    {
      name: 'diabetes_pedigree_function',
      label: 'Diabetes Pedigree Score',
      unit: 'score (0–2.5)',
      helper: 'Genetic score quantifying familial diabetes history weight',
      min: 0.05,
      max: 2.5,
      step: 0.01,
      required: true,
    },
  ];

  const presets = [
    {
      label: 'Low Risk Profile',
      tag: 'Healthy Adult Benchmark',
      color: 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100',
      data: {
        pregnancies: 0,
        glucose: 85,
        blood_pressure: 68,
        skin_thickness: 18,
        insulin: 50,
        bmi: 22.1,
        diabetes_pedigree_function: 0.22,
        age: 26,
        model_name: 'best',
        demographic_tag: 'Low Risk Sample',
      },
    },
    {
      label: 'Moderate Risk Profile',
      tag: 'Pre-diabetic Screening',
      color: 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100',
      data: {
        pregnancies: 2,
        glucose: 118,
        blood_pressure: 78,
        skin_thickness: 28,
        insulin: 110,
        bmi: 28.4,
        diabetes_pedigree_function: 0.48,
        age: 44,
        model_name: 'best',
        demographic_tag: 'Moderate Risk Sample',
      },
    },
    {
      label: 'High Risk Profile',
      tag: 'Metabolic Syndrome Cohort',
      color: 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100',
      data: {
        pregnancies: 5,
        glucose: 165,
        blood_pressure: 88,
        skin_thickness: 38,
        insulin: 195,
        bmi: 36.2,
        diabetes_pedigree_function: 0.82,
        age: 52,
        model_name: 'best',
        demographic_tag: 'High Risk Sample',
      },
    },
  ];

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const applyPreset = (presetData) => {
    setFormData(presetData);
    setErrors({});
    setSubmitError(null);
  };

  const validateForm = () => {
    const errs = {};
    if (formData.glucose < 40 || formData.glucose > 400) {
      errs.glucose = 'Glucose must be between 40 and 400 mg/dL';
    }
    if (formData.blood_pressure < 30 || formData.blood_pressure > 200) {
      errs.blood_pressure = 'Blood pressure must be between 30 and 200 mmHg';
    }
    if (formData.bmi < 12 || formData.bmi > 70) {
      errs.bmi = 'BMI must be between 12.0 and 70.0';
    }
    if (formData.age < 1 || formData.age > 120) {
      errs.age = 'Age must be between 1 and 120';
    }
    if (formData.diabetes_pedigree_function < 0.05 || formData.diabetes_pedigree_function > 2.5) {
      errs.diabetes_pedigree_function = 'Pedigree score must be between 0.05 and 2.5';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setSubmitError(null);

      const payload = {
        pregnancies: parseInt(formData.pregnancies, 10),
        glucose: parseFloat(formData.glucose),
        blood_pressure: parseFloat(formData.blood_pressure),
        skin_thickness: parseFloat(formData.skin_thickness || 0),
        insulin: parseFloat(formData.insulin || 0),
        bmi: parseFloat(formData.bmi),
        diabetes_pedigree_function: parseFloat(formData.diabetes_pedigree_function),
        age: parseFloat(formData.age),
        model_name: formData.model_name,
        demographic_tag: formData.demographic_tag || 'Screening Subject',
      };

      const result = await api.predict(payload);
      setLatestResult({
        ...result,
        input_data: payload,
      });
      setCurrentView('result');
    } catch (err) {
      setSubmitError(err.message || 'Failed to generate assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner variant="info" />

      {/* Preset Quick Loader */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Clinical Presets
          </h3>
          <span className="text-[11px] text-slate-400">— Click to populate representative patient profiles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset.data)}
              className={`p-3 rounded-xl border text-left transition-all ${preset.color}`}
            >
              <div className="font-semibold text-xs">{preset.label}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{preset.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Assessment Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Diagnostic Indicators</h2>
            <p className="text-xs text-slate-500">
              Enter 8 physiological parameters documented in the standard Pima Indians screening framework.
            </p>
          </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <span className="text-xs font-medium text-slate-500 pl-2">Classifier:</span>
              <select
                value={formData.model_name}
                onChange={(e) => handleInputChange('model_name', e.target.value)}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="best">Default Pipeline (Logistic Regression - Balanced, Calibrated)</option>
                <option value="Logistic Regression (Balanced)">Logistic Regression (Balanced, C=0.1)</option>
                <option value="Gradient Boosting">Gradient Boosting (Tuned Trees)</option>
                <option value="Random Forest">Random Forest (Ensemble Trees)</option>
                <option value="Support Vector Machine">Support Vector Machine (RBF/Linear)</option>
                <option value="K-Nearest Neighbors">K-Nearest Neighbors (Distance-Weighted)</option>
                <option value="Logistic Regression (Standard)">Logistic Regression (Standard)</option>
              </select>
            </div>
        </div>

        {/* Anonymous Identifier Tag */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 sm:w-44 flex-shrink-0">
            Anonymous Subject Tag:
          </label>
          <input
            type="text"
            value={formData.demographic_tag}
            onChange={(e) => handleInputChange('demographic_tag', e.target.value)}
            placeholder="e.g. Subject-42 or Clinic Assessment #8"
            maxLength={40}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-[11px] text-slate-400">Strictly no PII / real names</span>
        </div>

        {/* 8 Clinical Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => {
            const hasError = !!errors[field.name];
            return (
              <div key={field.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    {field.unit}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      hasError
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                  />
                </div>

                {hasError ? (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors[field.name]}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">{field.helper}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Feedback */}
        {submitError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Assessment Error</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              applyPreset(presets[0].data);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-bold shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Model Inference...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Evaluate Diabetes Risk</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
