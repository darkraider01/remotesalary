'use client';

import { Country, SalaryPeriod } from '@/types';

interface SalaryInputProps {
  salary: number;
  onSalaryChange: (salary: number) => void;
  period: SalaryPeriod;
  onPeriodChange: (period: SalaryPeriod) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  countries: Country[];
}

export function SalaryInput({
  salary,
  onSalaryChange,
  period,
  onPeriodChange,
  currency,
  onCurrencyChange,
  countries,
}: SalaryInputProps) {
  // Get unique currencies from countries
  const currencies = Array.from(new Set(countries.map((c) => c.currency)));

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-300 mb-2 block">
          Your Salary
        </span>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            {currency}
          </span>
          <input
            type="number"
            value={salary || ''}
            onChange={(e) => onSalaryChange(Number(e.target.value))}
            placeholder="Enter your salary"
            className="w-full pl-16 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                     text-white placeholder-slate-500 focus:outline-none focus:ring-2 
                     focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
                     text-lg font-semibold"
          />
        </div>
      </label>

      <div className="flex gap-3">
        {/* Period Toggle */}
        <div className="flex-1">
          <span className="text-sm font-medium text-slate-300 mb-2 block">
            Period
          </span>
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => onPeriodChange('monthly')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                period === 'monthly'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => onPeriodChange('yearly')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                period === 'yearly'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex-1">
          <span className="text-sm font-medium text-slate-300 mb-2 block">
            Currency
          </span>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="w-full py-2.5 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl
                     text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50
                     focus:border-violet-500/50 transition-all cursor-pointer"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr} className="bg-slate-800">
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
