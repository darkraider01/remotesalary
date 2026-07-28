'use client';

import { useState } from 'react';
import {
  Country,
  TaxDataMap,
  RentIndexMap,
  CostOfLivingMap,
  CurrencyRates,
  CalculatorInputs,
  CityTier,
  Lifestyle,
  SalaryPeriod,
} from '@/types';
import { useCalculations } from '@/hooks/useCalculations';
import { SalaryInput } from './SalaryInput';
import { CountrySelector } from './CountrySelector';
import { CityTierSelector } from './CityTierSelector';
import { LifestyleSlider } from './LifestyleSlider';
import { ResultsPanel } from './ResultsPanel';
import { ExpenseChart } from './ExpenseChart';
import { SavingsScore } from './SavingsScore';

interface CalculatorProps {
  countries: Country[];
  taxData: TaxDataMap;
  rentIndexData: RentIndexMap;
  costOfLivingData: CostOfLivingMap;
  currencyRates: CurrencyRates;
}

export function Calculator({
  countries,
  taxData,
  rentIndexData,
  costOfLivingData,
  currencyRates,
}: CalculatorProps) {
  // Input state
  const [salary, setSalary] = useState<number>(0);
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('yearly');
  const [currency, setCurrency] = useState<string>('USD');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [cityTier, setCityTier] = useState<CityTier>('tier1');
  const [lifestyle, setLifestyle] = useState<Lifestyle>('balanced');

  // Convert salary when target country changes
  const handleCountryChange = (newCountryCode: string) => {
    if (newCountryCode === countryCode) return;
    const newCountry = countries.find((c) => c.code === newCountryCode);
    if (newCountry) {
      const targetCurrency = newCountry.currency;
      if (targetCurrency !== currency && salary > 0 && currencyRates?.rates) {
        const oldRate = currencyRates.rates[currency] ?? 1;
        const newRate = currencyRates.rates[targetCurrency] ?? 1;
        if (oldRate > 0 && newRate > 0) {
          setSalary(Math.round(salary * (newRate / oldRate)));
        }
      }
      setCurrency(targetCurrency);
      setCountryCode(newCountryCode);
    }
  };

  // Convert salary when currency changes directly
  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) return;
    if (salary > 0 && currencyRates?.rates) {
      const oldRate = currencyRates.rates[currency] ?? 1;
      const newRate = currencyRates.rates[newCurrency] ?? 1;
      if (oldRate > 0 && newRate > 0) {
        setSalary(Math.round(salary * (newRate / oldRate)));
      }
    }
    setCurrency(newCurrency);
  };

  // Rescale salary when period (Yearly/Monthly) changes
  const handlePeriodChange = (newPeriod: SalaryPeriod) => {
    if (newPeriod === salaryPeriod) return;
    if (salary > 0) {
      if (newPeriod === 'monthly') {
        setSalary(Math.round(salary / 12));
      } else if (newPeriod === 'yearly') {
        setSalary(Math.round(salary * 12));
      }
    }
    setSalaryPeriod(newPeriod);
  };

  // Build inputs object
  const inputs: CalculatorInputs = {
    salary,
    salaryPeriod,
    currency,
    countryCode,
    cityTier,
    lifestyle,
  };

  // Calculate results
  const results = useCalculations({
    inputs,
    taxData,
    rentIndexData,
    costOfLivingData,
    currencyRates,
  });

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <div className="space-y-6">
        <div className="p-6 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Your Details
          </h2>

          <div className="space-y-6">
            <SalaryInput
              salary={salary}
              onSalaryChange={setSalary}
              period={salaryPeriod}
              onPeriodChange={handlePeriodChange}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              countries={countries}
            />

            <div className="h-px bg-slate-700/30" />

            <CountrySelector
              selectedCountry={countryCode}
              onCountryChange={handleCountryChange}
              countries={countries}
            />

            <div className="h-px bg-slate-700/30" />

            <CityTierSelector
              selectedTier={cityTier}
              onTierChange={setCityTier}
            />

            <div className="h-px bg-slate-700/30" />

            <LifestyleSlider
              lifestyle={lifestyle}
              onLifestyleChange={setLifestyle}
            />
          </div>
        </div>

        {/* Tax Info */}
        <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/20">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">
                  {countries.find((c) => c.code === countryCode)?.name}
                </strong>{' '}
                effective tax rate:{' '}
                <strong className="text-violet-400">
                  {((taxData[countryCode]?.effectiveRate ?? 0) * 100).toFixed(0)}%
                </strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {taxData[countryCode]?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6">
        {/* Savings Score - Highlighted */}
        <SavingsScore
          score={results.savingsScore}
          disposableIncome={results.disposableIncome}
        />

        {/* Financial Summary */}
        <div className="p-6 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30 shadow-xl">
          <ResultsPanel results={results} />
        </div>

        {/* Expense Chart */}
        <ExpenseChart results={results} />
      </div>
    </div>
  );
}
