import React from 'react';
import {
  FileText,
  Database,
  Layers,
  Cpu,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  HeartPulse,
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AboutMethodology() {
  const featuresList = [
    {
      name: 'Pregnancies',
      type: 'Count (0–17)',
      clinicalContext: 'Gestational stress on pancreatic beta cells. Multi-gravid subjects often exhibit progressive insulin resistance.',
    },
    {
      name: 'Glucose',
      type: 'mg/dL (Oral Glucose Tolerance Test)',
      clinicalContext: 'Primary biomarker for diabetes diagnosis. Fasting normal <100 mg/dL; prediabetes 100–125; diabetes ≥126 mg/dL.',
    },
    {
      name: 'Blood Pressure',
      type: 'mmHg (Diastolic)',
      clinicalContext: 'Cardiovascular resistance marker. Metabolic syndrome strongly co-occurs with systemic hypertension.',
    },
    {
      name: 'Skin Thickness',
      type: 'mm (Triceps Skinfold)',
      clinicalContext: 'Surrogate indicator for subcutaneous fat density and peripheral adiposity.',
    },
    {
      name: 'Insulin',
      type: 'µU/mL (2-Hour Serum)',
      clinicalContext: 'Pancreatic endocrine response. Elevated fasting insulin signals compensatory hyperinsulinemia.',
    },
    {
      name: 'BMI (Body Mass Index)',
      type: 'kg/m²',
      clinicalContext: 'Universal adiposity measure ($weight / height^2$). Adipose tissue secretes pro-inflammatory cytokines triggering insulin resistance.',
    },
    {
      name: 'Diabetes Pedigree Function',
      type: 'Genetic scoring metric (0.08–2.42)',
      clinicalContext: 'Quantitative representation of family history of diabetes, weighting degree of genetic relatedness.',
    },
    {
      name: 'Age',
      type: 'Years (21–81)',
      clinicalContext: 'Age-dependent senescence of pancreatic islet function combined with cumulative visceral adiposity.',
    },
  ];

  const algorithms = [
    {
      name: 'Gradient Boosting Classifier',
      role: 'Selected Production Pipeline (Calibrated Ensemble)',
      description:
        'An ensemble of shallow decision trees trained sequentially to minimize logistic loss with subsampling (50 trees, max_depth=3, learning_rate=0.1). Achieves the highest holdout discrimination (ROC-AUC: 0.8124) and lowest calibrated Brier score (0.1634) using Platt sigmoid scaling.',
    },
    {
      name: 'Logistic Regression (Class-Balanced)',
      role: 'High Sensitivity Screening Baseline',
      description:
        'Standardized linear model with inverse-frequency class weighting to penalize missed positive cases. Achieves 66.7% holdout recall at standard threshold and up to 88.9% recall at threshold 0.35, with minimal train/test overfitting gap (5.4%).',
    },
    {
      name: 'Random Forest Classifier',
      role: 'Bagged Tree Ensemble (High Specificity)',
      description:
        'An ensemble of 100 bootstrapped decision trees (max_depth=4, min_samples_leaf=2) that minimizes variance across subsets. It achieves strong true negative detection (87 of 100 healthy subjects) but exhibits conservative recall in screening.',
    },
    {
      name: 'Support Vector Machine (SVM)',
      role: 'Maximal Margin Linear Separator',
      description:
        'Evaluates linear and RBF hyperplanes in standardized continuous feature space with L2 regularization (C=2.0). Provides competitive class separation (ROC-AUC: 0.8137).',
    },
    {
      name: 'K-Nearest Neighbors (KNN)',
      role: 'Non-Parametric Distance Metric',
      description:
        'Classifies subjects based on Euclidean distance to 15 nearest training patients. While effective on localized patterns, it exhibits significant train/test overfitting gap due to dimensional sparsity.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <DisclaimerBanner variant="info" />

      {/* Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dataset Provenance: Pima Indians Diabetes Database</h2>
            <p className="text-xs text-slate-500">National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The underlying benchmark dataset was gathered by the NIDDK from a population of Pima Indian heritage near Phoenix, Arizona. All patients in this legacy research cohort are female, at least 21 years old, and were screened for type-2 diabetes according to World Health Organization criteria.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xl font-extrabold text-slate-900 block">768</span>
            <span className="text-[11px] text-slate-400">Total Subjects</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xl font-extrabold text-slate-900 block">8</span>
            <span className="text-[11px] text-slate-400">Input Features</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xl font-extrabold text-teal-600 block">65.1% / 34.9%</span>
            <span className="text-[11px] text-slate-400">Negative / Positive</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xl font-extrabold text-indigo-600 block">5-Fold</span>
            <span className="text-[11px] text-slate-400">Cross-Validated</span>
          </div>
        </div>
      </div>

      {/* Feature Definitions Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Evaluated Physiological Biomarkers</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {featuresList.map((f, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-sm font-bold text-slate-900">{f.name}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 w-fit">
                  {f.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{f.clinicalContext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preprocessing Architecture */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Preprocessing & Pipeline Architecture</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">1. Biological Zero Handling</h4>
            <p className="text-slate-600 leading-relaxed">
              In raw diabetes survey records, zero values for Glucose, BP, Skinfold, Insulin, and BMI represent missing clinical entries rather than real null quantities. The pipeline replaces documented zeros with NaN and performs robust median imputation fitted strictly on the training partition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">2. Standardized Scaling</h4>
            <p className="text-slate-600 leading-relaxed">
              Features operate across disparate numerical magnitudes (Insulin up to 800 vs Pedigree Function at 0.5). A scikit-learn <code className="bg-slate-200 px-1 rounded">StandardScaler</code> normalizes attributes to mean zero and unit variance, preventing high-magnitude dominance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">3. Stratified Splitting</h4>
            <p className="text-slate-600 leading-relaxed">
              An 80/20 train/test stratified split guarantees identical positive/negative class proportions across both training and holdout validation sets, preventing sampling bias.
            </p>
          </div>
        </div>
      </div>

      {/* Algorithmic Implementations */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Machine Learning Classification Models</h3>
        </div>

        <div className="space-y-4">
          {algorithms.map((algo, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-sm">{algo.name}</span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md w-fit border border-teal-200">
                  {algo.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{algo.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical Considerations & Dataset Limitations */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">Dataset Limitations & Ethical AI Notice</h3>
        </div>

        <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
          <p>
            <strong>Demographic Specificity:</strong> The Pima Indians cohort consists solely of adult female individuals from a specific geographic and genetic lineage with disproportionately high baseline diabetes prevalence. Caution is required when attempting to generalize model estimates to broader, multi-ethnic, male, or pediatric demographics.
          </p>
          <p>
            <strong>High Missingness in Laboratory Variables:</strong> In the original survey, serum insulin ($48.7\%$ zeros) and skin thickness ($29.6\%$ zeros) were frequently uncollected. While median imputation allows inference to proceed, laboratory confirmation remains indispensable.
          </p>
          <p>
            <strong>Uncalibrated Statistical Probability:</strong> Model probability scores indicate classification confidence within the trained algorithmic feature space and must <em>never</em> be interpreted as an absolute actuarial or diagnostic lifetime risk percentage.
          </p>
        </div>
      </div>
    </div>
  );
}
