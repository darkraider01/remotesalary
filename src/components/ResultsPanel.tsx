'use client';

import { formatCurrency } from '@/lib/calculations';
import { CalculationResult } from '@/types';

interface ResultsPanelProps {
  results: CalculationResult;
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({ label, value, subtext, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border-violet-500/30'
          : 'bg-slate-800/30 border-slate-700/30'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={highlight ? 'text-violet-400' : 'text-slate-500'}>
          {icon}
        </span>
      </div>
      <p
        className={`text-xl font-bold ${
          highlight ? 'text-violet-300' : 'text-white'
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const {
    annualSalaryUSD,
    annualTax,
    monthlyRent,
    monthlyLiving,
    disposableIncome,
  } = results;

  const monthlyIncome = annualSalaryUSD > 0 ? annualSalaryUSD / 12 : 0;
  const totalMonthlyExpenses = monthlyRent + monthlyLiving;
  const rawExpensePct = monthlyIncome > 0 ? (totalMonthlyExpenses / monthlyIncome) * 100 : 0;
  const safeExpensePercentage = isFinite(rawExpensePct) && !isNaN(rawExpensePct) ? rawExpensePct : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Financial Summary
      </h3>

      {/* Highlighted - Disposable Income */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-violet-300 font-medium">
            Annual Disposable Income
          </span>
          <svg
            className="w-6 h-6 text-violet-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            suppressHydrationWarning
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-3xl font-extrabold text-white">
          {formatCurrency(disposableIncome)}
        </p>
        <p className="text-xs text-violet-300/70 mt-1">
          {formatCurrency(Math.round(disposableIncome / 12))}/month after tax & living costs
        </p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Est. Annual Tax"
          value={formatCurrency(annualTax)}
          icon={
            <svg
              className="w-4 h-4 text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Est. Monthly Rent"
          value={formatCurrency(monthlyRent)}
          icon={
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
        />
        <MetricCard
          label="Monthly Living Cost"
          value={formatCurrency(monthlyLiving)}
          icon={
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Monthly Disposable"
          value={formatCurrency(Math.round(disposableIncome / 12))}
          highlight
          icon={
            <svg
              className="w-4 h-4 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Expense Allocation Bar */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Expense Allocation</span>
          <span className="text-xs font-semibold text-white">
            {safeExpensePercentage.toFixed(1)}% of income
          </span>
        </div>
        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
            style={{
              width: `${Math.min(safeExpensePercentage, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
