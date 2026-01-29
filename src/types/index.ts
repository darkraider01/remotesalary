// Country data structure
export interface Country {
  code: string;
  name: string;
  currency: string;
  region: string;
  capital: string;
}

// Tax data per country
export interface TaxData {
  effectiveRate: number;
  description: string;
}

export type TaxDataMap = Record<string, TaxData>;

// Rent index per city tier
export interface RentIndex {
  capital: number;
  tier1: number;
  tier2: number;
}

export type RentIndexMap = Record<string, RentIndex>;

// Cost of living data
export interface CostOfLivingData {
  index: number;
  description: string;
}

export type CostOfLivingMap = Record<string, CostOfLivingData>;

// Currency rates
export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

// City tier options
export type CityTier = 'capital' | 'tier1' | 'tier2';

// Lifestyle options
export type Lifestyle = 'frugal' | 'balanced' | 'premium';

// Salary period
export type SalaryPeriod = 'monthly' | 'yearly';

// Calculator inputs
export interface CalculatorInputs {
  salary: number;
  salaryPeriod: SalaryPeriod;
  currency: string;
  countryCode: string;
  cityTier: CityTier;
  lifestyle: Lifestyle;
}

// Calculation results
export interface CalculationResult {
  // Input normalization
  annualSalaryUSD: number;
  
  // Core outputs
  annualTax: number;
  monthlyRent: number;
  monthlyLiving: number;
  annualExpenses: number;
  disposableIncome: number;
  savingsScore: number;
  
  // Breakdown percentages
  taxPercentage: number;
  rentPercentage: number;
  livingPercentage: number;
  savingsPercentage: number;
}

// Lifestyle multipliers
export const LIFESTYLE_MULTIPLIERS: Record<Lifestyle, number> = {
  frugal: 0.8,
  balanced: 1.0,
  premium: 1.3,
} as const;

// Baseline values
export const RENT_BASELINE_USD = 1000;
export const LIVING_BASELINE_USD = 800;

// City tier display names
export const CITY_TIER_LABELS: Record<CityTier, string> = {
  capital: 'Capital City',
  tier1: 'Tier-1 City',
  tier2: 'Tier-2 City',
} as const;

// Lifestyle display names
export const LIFESTYLE_LABELS: Record<Lifestyle, string> = {
  frugal: 'Frugal',
  balanced: 'Balanced',
  premium: 'Premium',
} as const;
