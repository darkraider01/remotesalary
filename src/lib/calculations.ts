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
 * Dynamically adjust effective tax rate based on annual salary relative to $85,000 USD baseline
 */
export function getAdjustedTaxRate(baseRate: number, annualSalaryUSD: number): number {
  if (annualSalaryUSD <= 0 || baseRate <= 0) return 0;
  const ratio = annualSalaryUSD / 85000;

  if (ratio < 0.5) {
    return baseRate * 0.5;
  }
  if (ratio < 1.0) {
    const scale = 0.5 + (ratio - 0.5) * 1.0; // Interpolate 0.5x to 1.0x
    return baseRate * scale;
  }
  if (ratio <= 2.0) {
    const scale = 1.0 + (ratio - 1.0) * 0.3; // Interpolate 1.0x to 1.3x
    return Math.min(baseRate * scale, 0.50);
  }
  return Math.min(baseRate * 1.3, 0.50);
}

/**
 * Calculate effective tax amount with progressive rate adjustment
 */
export function calculateTax(annualSalary: number, effectiveRate: number): number {
  if (annualSalary <= 0 || effectiveRate <= 0) return 0;
  const adjustedRate = getAdjustedTaxRate(effectiveRate, annualSalary);
  return annualSalary * adjustedRate;
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
 * Helper to check if a value is a valid positive number
 */
function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0;
}

/**
 * Get rent index for a specific city tier with robust fallback cascade
 */
export function getRentIndexForTier(
  rentData: RentIndex | Record<string, number> | undefined | null,
  cityTier: CityTier
): number {
  if (!rentData) return 100;

  // 1. Direct lookup for requested tier
  const directVal = rentData[cityTier];
  if (isValidNumber(directVal)) return directVal;

  // 2. Try normalized tier key if there are space/hyphen key variants
  const normalizedKey = cityTier.replace(/\s|-/g, '').toLowerCase();
  const normalizedVal = rentData[normalizedKey];
  if (isValidNumber(normalizedVal)) return normalizedVal;

  // 3. Fallback to tier1
  const tier1Val = rentData['tier1'];
  if (isValidNumber(tier1Val)) return tier1Val;

  // 4. Fallback to capital
  const capitalVal = rentData['capital'];
  if (isValidNumber(capitalVal)) return capitalVal;

  // 5. Default baseline
  return 100;
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
  const rawAnnualSalaryUSD = normalizeToAnnualUSD(salary, salaryPeriod, currency, currencyRates);
  const annualSalaryUSD = isValidNumber(rawAnnualSalaryUSD) ? rawAnnualSalaryUSD : 0;

  // Get country-specific data
  const rawTaxRate = taxData[countryCode]?.effectiveRate;
  const effectiveTaxRate = typeof rawTaxRate === 'number' && !isNaN(rawTaxRate) && isFinite(rawTaxRate) ? rawTaxRate : 0;
  const rentData = rentIndexData[countryCode] ?? { capital: 100, tier1: 80, tier2: 60 };
  const colData = costOfLivingData[countryCode] ?? { index: 100 };

  // Calculate tax
  const annualTax = calculateTax(annualSalaryUSD, effectiveTaxRate);

  // Calculate rent with safe index fallback
  const rentIndex = getRentIndexForTier(rentData, cityTier);
  const monthlyRent = calculateMonthlyRent(rentIndex);

  // Calculate living expenses with safe col index fallback
  const colIndex = isValidNumber(colData?.index) ? colData.index : 100;
  const monthlyLiving = calculateMonthlyLiving(colIndex, lifestyle);

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

  // Helper for safe percentage calculation
  const safePercent = (numerator: number, denominator: number) => {
    if (denominator <= 0 || !isFinite(numerator) || isNaN(numerator)) return 0;
    const pct = (numerator / denominator) * 100;
    return isFinite(pct) && !isNaN(pct) ? pct : 0;
  };

  // Calculate percentages for breakdown
  const taxPercentage = safePercent(annualTax, annualSalaryUSD);
  const rentPercentage = safePercent(monthlyRent * 12, annualSalaryUSD);
  const livingPercentage = safePercent(monthlyLiving * 12, annualSalaryUSD);
  const savingsPercentage = safePercent(disposableIncome, annualSalaryUSD);

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
