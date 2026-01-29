'use client';

import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { CalculationResult } from '@/types';

interface ExpenseChartProps {
  results: CalculationResult;
}

interface BarData {
  label: string;
  value: number;
  percentage: number;
  color: string;
  bgColor: string;
}

export function ExpenseChart({ results }: ExpenseChartProps) {
  const {
    annualSalaryUSD,
    annualTax,
    monthlyRent,
    monthlyLiving,
    disposableIncome,
    taxPercentage,
    rentPercentage,
    livingPercentage,
    savingsPercentage,
  } = results;

  const bars: BarData[] = [
    {
      label: 'Taxes',
      value: annualTax,
      percentage: taxPercentage,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-500/20',
    },
    {
      label: 'Rent',
      value: monthlyRent * 12,
      percentage: rentPercentage,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/20',
    },
    {
      label: 'Living',
      value: monthlyLiving * 12,
      percentage: livingPercentage,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Savings',
      value: Math.max(0, disposableIncome),
      percentage: Math.max(0, savingsPercentage),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/20',
    },
  ];

  const maxPercentage = Math.max(...bars.map((b) => b.percentage), 1);

  return (
    <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
      <h3 className="text-lg font-semibold text-white mb-6">
        Annual Expense Breakdown
      </h3>

      {/* Horizontal Bar Chart */}
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">{bar.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  {formatPercentage(bar.percentage)}
                </span>
                <span className="text-white font-semibold min-w-[100px] text-right">
                  {formatCurrency(bar.value)}
                </span>
              </div>
            </div>
            <div className="h-3 bg-slate-700/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-500 ease-out`}
                style={{
                  width: `${(bar.percentage / maxPercentage) * 100}%`,
                  minWidth: bar.percentage > 0 ? '8px' : '0',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stacked Visualization */}
      <div className="mt-8 pt-6 border-t border-slate-700/30">
        <p className="text-sm text-slate-400 mb-3">Income Distribution</p>
        <div className="h-8 rounded-lg overflow-hidden flex">
          {bars.map((bar, index) => (
            <div
              key={bar.label}
              className={`bg-gradient-to-r ${bar.color} transition-all duration-500 relative group`}
              style={{ width: `${Math.max(bar.percentage, 0)}%` }}
            >
              {bar.percentage > 10 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/90">
                  {Math.round(bar.percentage)}%
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                            bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100
                            transition-opacity pointer-events-none whitespace-nowrap z-10">
                {bar.label}: {formatCurrency(bar.value)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {bars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${bar.color}`} />
              <span className="text-xs text-slate-500">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between">
        <span className="text-slate-400">Total Annual Income</span>
        <span className="text-xl font-bold text-white">
          {formatCurrency(annualSalaryUSD)}
        </span>
      </div>
    </div>
  );
}
