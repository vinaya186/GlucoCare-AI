import React from 'react';

export default function ProbabilityGauge({ percentage = 0, riskLevel = 'Low Risk', size = 180 }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // We draw a 240 degree arc (from 150 deg to 390 deg)
  const angle = 240;
  const arcLength = (angle / 360) * circumference;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = arcLength - (clampedPercentage / 100) * arcLength;

  let strokeColor = '#10b981'; // green
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  let textColor = 'text-emerald-700';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (clampedPercentage >= 60) {
    strokeColor = '#e11d48'; // rose
    glowColor = 'rgba(225, 29, 72, 0.2)';
    textColor = 'text-rose-700';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (clampedPercentage >= 35) {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.2)';
    textColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-210"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 2px 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            {clampedPercentage}%
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
            Model Estimate
          </span>
        </div>
      </div>

      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
        {riskLevel}
      </div>
    </div>
  );
}
