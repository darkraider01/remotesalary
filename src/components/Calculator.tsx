'use client';

import { useState, useEffect } from 'react';
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

  // Update currency when country changes
  useEffect(() => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setCurrency(country.currency);
    }
  }, [countryCode, countries]);

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
              onPeriodChange={setSalaryPeriod}
              currency={currency}
              onCurrencyChange={setCurrency}
              countries={countries}
            />

            <div className="h-px bg-slate-700/30" />

            <CountrySelector
              selectedCountry={countryCode}
              onCountryChange={setCountryCode}
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
