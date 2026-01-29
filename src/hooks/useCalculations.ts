'use client';

import { useMemo } from 'react';
import { calculateResults } from '@/lib/calculations';
import {
  CalculationResult,
  CalculatorInputs,
  CostOfLivingMap,
  CurrencyRates,
  RentIndexMap,
  TaxDataMap,
} from '@/types';

interface UseCalculationsProps {
  inputs: CalculatorInputs;
  taxData: TaxDataMap;
  rentIndexData: RentIndexMap;
  costOfLivingData: CostOfLivingMap;
  currencyRates: CurrencyRates;
}

/**
 * React hook that wraps calculation logic with memoization
 * Only recalculates when inputs or data change
 */
export function useCalculations({
  inputs,
  taxData,
  rentIndexData,
  costOfLivingData,
  currencyRates,
}: UseCalculationsProps): CalculationResult {
  return useMemo(() => {
    return calculateResults(
      inputs,
      taxData,
      rentIndexData,
      costOfLivingData,
      currencyRates
    );
  }, [inputs, taxData, rentIndexData, costOfLivingData, currencyRates]);
}

/**
 * Get color class for savings score
 */
export function getSavingsScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score < 20) {
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
    };
  }
  if (score < 40) {
    return {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
    };
  }
  return {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  };
}

/**
 * Get label for savings score
 */
export function getSavingsScoreLabel(score: number): string {
  if (score < 20) return 'Needs Improvement';
  if (score < 40) return 'Moderate';
  if (score < 60) return 'Good';
  if (score < 80) return 'Very Good';
  return 'Excellent';
}
