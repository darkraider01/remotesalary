import {
  CalculationResult,
  CalculatorInputs,
  CityTier,
  CostOfLivingMap,
  CurrencyRates,
  Lifestyle,
  LIFESTYLE_MULTIPLIERS,
  LIVING_BASELINE_USD,
  RENT_BASELINE_USD,
  RentIndexMap,
  TaxDataMap,
} from '@/types';

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert salary to annual USD
 */
export function normalizeToAnnualUSD(
  salary: number,
  period: 'monthly' | 'yearly',
  currency: string,
  currencyRates: CurrencyRates
): number {
  const rate = currencyRates.rates[currency] ?? 1;
  const salaryUSD = salary / rate;
  return period === 'monthly' ? salaryUSD * 12 : salaryUSD;
}

/**
 * Calculate effective tax amount
 */
export function calculateTax(annualSalary: number, effectiveRate: number): number {
  return annualSalary * effectiveRate;
}

/**
 * Calculate monthly rent based on city tier and rent index
 */
export function calculateMonthlyRent(
  rentIndex: number,
  baselineUSD: number = RENT_BASELINE_USD
): number {
  return baselineUSD * (rentIndex / 100);
}

/**
 * Calculate monthly living expenses based on lifestyle
 */
export function calculateMonthlyLiving(
  costOfLivingIndex: number,
  lifestyle: Lifestyle,
  baselineUSD: number = LIVING_BASELINE_USD
): number {
  const multiplier = LIFESTYLE_MULTIPLIERS[lifestyle];
  return baselineUSD * (costOfLivingIndex / 100) * multiplier;
}

/**
 * Calculate disposable income (what's left after tax and expenses)
 */
export function calculateDisposableIncome(
  annualSalary: number,
  annualTax: number,
  monthlyRent: number,
  monthlyLiving: number
): number {
  const annualExpenses = (monthlyRent + monthlyLiving) * 12;
  return annualSalary - annualTax - annualExpenses;
}

/**
 * Calculate savings score (0-100)
 */
export function calculateSavingsScore(
  disposableIncome: number,
  annualSalary: number
): number {
  if (annualSalary <= 0) return 0;
  const rawScore = (disposableIncome / annualSalary) * 100;
  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Get rent index for a specific city tier
 */
export function getRentIndexForTier(
  rentData: { capital: number; tier1: number; tier2: number },
  cityTier: CityTier
): number {
  return rentData[cityTier];
}

/**
 * Main calculation function that computes all results
 */
export function calculateResults(
  inputs: CalculatorInputs,
  taxData: TaxDataMap,
  rentIndexData: RentIndexMap,
  costOfLivingData: CostOfLivingMap,
  currencyRates: CurrencyRates
): CalculationResult {
  const { salary, salaryPeriod, currency, countryCode, cityTier, lifestyle } = inputs;

  // Normalize salary to annual USD
  const annualSalaryUSD = normalizeToAnnualUSD(salary, salaryPeriod, currency, currencyRates);

  // Get country-specific data
  const effectiveTaxRate = taxData[countryCode]?.effectiveRate ?? 0;
  const rentData = rentIndexData[countryCode] ?? { capital: 100, tier1: 80, tier2: 60 };
  const colData = costOfLivingData[countryCode] ?? { index: 100 };

  // Calculate tax
  const annualTax = calculateTax(annualSalaryUSD, effectiveTaxRate);

  // Calculate rent
  const rentIndex = getRentIndexForTier(rentData, cityTier);
  const monthlyRent = calculateMonthlyRent(rentIndex);

  // Calculate living expenses
  const monthlyLiving = calculateMonthlyLiving(colData.index, lifestyle);

  // Calculate annual expenses
  const annualExpenses = (monthlyRent + monthlyLiving) * 12;

  // Calculate disposable income
  const disposableIncome = calculateDisposableIncome(
    annualSalaryUSD,
    annualTax,
    monthlyRent,
    monthlyLiving
  );

  // Calculate savings score
  const savingsScore = calculateSavingsScore(disposableIncome, annualSalaryUSD);

  // Calculate percentages for breakdown
  const taxPercentage = annualSalaryUSD > 0 ? (annualTax / annualSalaryUSD) * 100 : 0;
  const rentPercentage = annualSalaryUSD > 0 ? ((monthlyRent * 12) / annualSalaryUSD) * 100 : 0;
  const livingPercentage = annualSalaryUSD > 0 ? ((monthlyLiving * 12) / annualSalaryUSD) * 100 : 0;
  const savingsPercentage = annualSalaryUSD > 0 ? (disposableIncome / annualSalaryUSD) * 100 : 0;

  return {
    annualSalaryUSD,
    annualTax,
    monthlyRent,
    monthlyLiving,
    annualExpenses,
    disposableIncome,
    savingsScore,
    taxPercentage,
    rentPercentage,
    livingPercentage,
    savingsPercentage,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
