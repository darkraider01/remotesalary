'use client';

import { formatCurrency } from '@/lib/calculations';
import { CalculationResult } from '@/types';
import { getSavingsScoreColor, getSavingsScoreLabel } from '@/hooks/useCalculations';

interface SavingsScoreProps {
  score: number;
  disposableIncome: number;
}

export function SavingsScore({ score, disposableIncome }: SavingsScoreProps) {
  const colors = getSavingsScoreColor(score);
  const label = getSavingsScoreLabel(score);

  // Calculate the circumference for the progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className={`relative p-6 rounded-2xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between">
        {/* Score Ring */}
        <div className="relative">
          <svg width="160" height="160" className="transform -rotate-90" suppressHydrationWarning>
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-800/50"
              suppressHydrationWarning
            />
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className={colors.text}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              suppressHydrationWarning
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 ml-6">
          <h3 className="text-lg font-semibold text-white mb-1">
            Savings Score
          </h3>
          <p className={`text-sm font-medium ${colors.text} mb-4`}>{label}</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Disposable Income</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(disposableIncome)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Annual savings after all expenses
            </p>
          </div>
        </div>
      </div>

      {/* Score Scale */}
      <div className="mt-6 pt-4 border-t border-slate-700/30">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Poor</span>
          <span>Moderate</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-lg transition-all duration-300"
            style={{ left: `${score}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>
    </div>
  );
}
