import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function DisclaimerBanner({ variant = 'info', className = '' }) {
  if (variant === 'warning') {
    return (
      <div className={`p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-3 ${className}`}>
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-950">Non-Diagnostic Screening Tool: </span>
          GlucoCare AI outputs statistical estimates based on patterns in the Pima Indians Diabetes research dataset.
          It does <strong>not</strong> substitute for laboratory diagnostic tests (such as HbA1c, OGTT, or fasting plasma glucose) conducted by a qualified healthcare professional.
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-950 text-xs sm:text-sm flex items-start gap-3 ${className}`}>
      <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
      <div className="leading-relaxed text-teal-900">
        <span className="font-semibold text-teal-950">Clinical Disclaimer & Research Use: </span>
        Predictions and probabilities reflect uncalibrated machine learning approximations.
        Always consult a licensed medical clinician for diagnostic evaluation and before making therapeutic or lifestyle decisions.
      </div>
    </div>
  );
}
