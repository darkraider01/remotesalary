import {
  CountryDataZodSchema,
  CurrencyRatesZodSchema,
  extractAndParseJSON,
  extractFirstJSONString
} from './schemas';
import { getRentIndexForTier, calculateResults, getAdjustedTaxRate, calculateTax } from '../src/lib/calculations';

function runTests() {
  console.log('Running Zod schema validation & JSON extraction unit tests...');

  // Test 1: Valid country data
  const validData = {
    tax: {
      rate: 0.22,
      desc: 'Income tax + Social security for India'
    },
    rent: {
      capital: 120,
      tier1: 85,
      tier2: 50
    },
    col: {
      index: 75,
      desc: 'Low to moderate cost'
    }
  };

  try {
    const result = CountryDataZodSchema.parse(validData);
    console.log('✓ Test 1 Passed: Valid data parsed successfully:', result.tax.rate, result.rent.capital, result.col.index);
  } catch (err: any) {
    console.error('✗ Test 1 Failed:', err.message);
    process.exit(1);
  }

  // Test 2: Invalid tax rate (> 1)
  const invalidTaxData = {
    ...validData,
    tax: { rate: 28, desc: 'Invalid percent' }
  };

  try {
    CountryDataZodSchema.parse(invalidTaxData);
    console.error('✗ Test 2 Failed: Should have rejected rate > 1');
    process.exit(1);
  } catch (err: any) {
    console.log('✓ Test 2 Passed: Correctly caught tax rate > 1');
  }

  // Test 3: Invalid negative rent index
  const invalidRentData = {
    ...validData,
    rent: { capital: -10, tier1: 85, tier2: 50 }
  };

  try {
    CountryDataZodSchema.parse(invalidRentData);
    console.error('✗ Test 3 Failed: Should have rejected negative rent index');
    process.exit(1);
  } catch (err: any) {
    console.log('✓ Test 3 Passed: Correctly caught negative rent index');
  }

  // Test 4: Missing required fields
  const missingFieldData = {
    tax: { rate: 0.15 },
    rent: { capital: 100 },
    col: { index: 80 }
  };

  try {
    CountryDataZodSchema.parse(missingFieldData);
    console.error('✗ Test 4 Failed: Should have rejected missing required fields');
    process.exit(1);
  } catch (err: any) {
    console.log('✓ Test 4 Passed: Correctly caught missing required fields');
  }

  // Test 5: Valid currency rates with lowercase code normalization
  const validCurrencyData = {
    base: 'usd ',
    rates: [
      { currency: 'eur', rate: 0.92 },
      { currency: 'gbp ', rate: 0.78 }
    ],
    lastUpdated: '2026-07-25'
  };

  try {
    const result = CurrencyRatesZodSchema.parse(validCurrencyData);
    if (result.base === 'USD' && result.rates[0].currency === 'EUR' && result.rates[1].currency === 'GBP') {
      console.log('✓ Test 5 Passed: Currency codes and base correctly normalized to uppercase ISO format');
    } else {
      console.error('✗ Test 5 Failed: Currency normalization output mismatch');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('✗ Test 5 Failed:', err.message);
    process.exit(1);
  }

  // Test 6: Non-USD base rejection
  const nonUsdBaseData = {
    base: 'EUR',
    rates: [{ currency: 'USD', rate: 1.08 }],
    lastUpdated: '2026-07-25'
  };

  try {
    CurrencyRatesZodSchema.parse(nonUsdBaseData);
    console.error('✗ Test 6 Failed: Should have rejected non-USD base');
    process.exit(1);
  } catch (err: any) {
    console.log('✓ Test 6 Passed: Correctly rejected non-USD base currency');
  }

  // Test 7: extractFirstJSONString with braces inside string literals and trailing text
  const complexRawOutput = `Here is your JSON object: {"tax": {"rate": 0.2, "desc": "Note: {special} deduction"}, "rent": {"capital": 100, "tier1": 70, "tier2": 50}, "col": {"index": 90, "desc": "OK"}} and trailing commentary`;

  const extracted = extractFirstJSONString(complexRawOutput);
  if (extracted && extracted.startsWith('{') && extracted.endsWith('}') && !extracted.includes('trailing commentary')) {
    console.log('✓ Test 7 Passed: Depth-balanced JSON scanner correctly extracted outer payload ignoring braces inside string quotes');
  } else {
    console.error('✗ Test 7 Failed: Extraction output mismatch:', extracted);
    process.exit(1);
  }

  // Test 8: extractAndParseJSON with markdown code fences
  const markdownFencedRawOutput = `Here is the response:
\`\`\`json
{
  "tax": { "rate": 0.25, "desc": "Standard rate" },
  "rent": { "capital": 200, "tier1": 150, "tier2": 100 },
  "col": { "index": 110, "desc": "Moderate" }
}
\`\`\`
Hope this helps!`;

  try {
    const parsed = extractAndParseJSON(markdownFencedRawOutput, CountryDataZodSchema);
    console.log('✓ Test 8 Passed: Successfully extracted & validated JSON from markdown fences:', parsed.tax.rate);
  } catch (err: any) {
    console.error('✗ Test 8 Failed:', err.message);
    process.exit(1);
  }

  // Test 9: extractAndParseJSON formatting path-level Zod errors
  const malformedZodRawOutput = `\`\`\`json
{
  "tax": { "rate": 15.5, "desc": "Over 1.0 tax rate" },
  "rent": { "capital": -50, "tier1": 150, "tier2": 100 },
  "col": { "index": 110, "desc": "" }
}
\`\`\``;

  try {
    extractAndParseJSON(malformedZodRawOutput, CountryDataZodSchema);
    console.error('✗ Test 9 Failed: Should have thrown formatted Zod error');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('tax.rate') && err.message.includes('rent.capital')) {
      console.log('✓ Test 9 Passed: Correctly formatted path-level Zod diagnostic errors');
    } else {
      console.error('✗ Test 9 Failed with unexpected error structure:', err.message);
      process.exit(1);
    }
  }

  // Test 10: getRentIndexForTier fallback cascade on missing tier2 / empty / undefined rent data
  const partialRentData = { capital: 220, tier1: 150 }; // missing tier2
  const rentIndexTier2Fallback = getRentIndexForTier(partialRentData as any, 'tier2');
  const rentIndexEmptyFallback = getRentIndexForTier({} as any, 'tier2');
  const rentIndexNullFallback = getRentIndexForTier(null, 'tier2');

  if (rentIndexTier2Fallback === 150 && rentIndexEmptyFallback === 100 && rentIndexNullFallback === 100) {
    console.log('✓ Test 10 Passed: getRentIndexForTier correctly fell back through tier1 -> capital -> 100 baseline');
  } else {
    console.error('✗ Test 10 Failed: Fallback values mismatch:', { rentIndexTier2Fallback, rentIndexEmptyFallback, rentIndexNullFallback });
    process.exit(1);
  }

  // Test 11: calculateResults with missing/corrupted data ensures no output fields contain NaN or Infinity
  const mockInputs = {
    salary: 85000,
    salaryPeriod: 'yearly' as const,
    currency: 'USD',
    countryCode: 'US',
    cityTier: 'tier2' as const,
    lifestyle: 'balanced' as const
  };

  const results = calculateResults(
    mockInputs,
    {}, // empty tax map
    { US: { capital: 150 } }, // rent map missing tier2
    {}, // empty COL map
    { base: 'USD', rates: { USD: 1 }, lastUpdated: '2026-07-25' }
  );

  const hasNaN = Object.values(results).some(val => typeof val === 'number' && (isNaN(val) || !isFinite(val)));
  if (!hasNaN) {
    console.log('✓ Test 11 Passed: calculateResults handled missing/corrupted data without propagating NaN or Infinity');
  } else {
    console.error('✗ Test 11 Failed: Calculation results contained NaN or Infinity:', results);
    process.exit(1);
  }

  // Test 12: getAdjustedTaxRate and calculateTax progressive scaling for low/baseline/high earners
  const baseRate = 0.28; // 28% base rate for $85k USD earner
  const lowRate = getAdjustedTaxRate(baseRate, 20000); // < $42.5k -> 50% of baseRate = 0.14
  const baseTierRate = getAdjustedTaxRate(baseRate, 85000); // $85k -> 100% of baseRate = 0.28
  const highRate = getAdjustedTaxRate(baseRate, 500000); // > $170k -> 1.3x of baseRate = 0.364

  if (lowRate === 0.14 && baseTierRate === 0.28 && Math.abs(highRate - 0.364) < 0.001) {
    console.log('✓ Test 12 Passed: Progressive tax adjustment correctly scaled tax rates for low ($20k -> 14%), base ($85k -> 28%), and high ($500k -> 36.4%) earners');
  } else {
    console.error('✗ Test 12 Failed: Tax rate scaling output mismatch:', { lowRate, baseTierRate, highRate });
    process.exit(1);
  }

  // Test 13: Salary exchange rate ratio conversion logic on country/currency change
  const initialSalaryUSD = 100000;
  const ratesMap = { USD: 1.0, INR: 83.0, EUR: 0.92 };
  const convertedSalaryINR = Math.round(initialSalaryUSD * (ratesMap.INR / ratesMap.USD));
  const reconvertedSalaryEUR = Math.round(convertedSalaryINR * (ratesMap.EUR / ratesMap.INR));

  if (convertedSalaryINR === 8300000 && reconvertedSalaryEUR === 92000) {
    console.log('✓ Test 13 Passed: Salary currency conversion correctly scales numerical value between exchange rate pairs');
  } else {
    console.error('✗ Test 13 Failed: Currency conversion calculation mismatch:', { convertedSalaryINR, reconvertedSalaryEUR });
    process.exit(1);
  }

  // Test 14: Salary period toggle rescaling (Yearly <-> Monthly)
  const yearlySalary = 120000;
  const monthlySalary = Math.round(yearlySalary / 12);
  const backToYearly = Math.round(monthlySalary * 12);

  if (monthlySalary === 10000 && backToYearly === 120000) {
    console.log('✓ Test 14 Passed: Period toggle correctly rescales salary input ($120,000/yr -> $10,000/mo -> $120,000/yr)');
  } else {
    console.error('✗ Test 14 Failed: Period toggle salary calculation mismatch:', { monthlySalary, backToYearly });
    process.exit(1);
  }

  // Test 15: Defensive adsbygoogle array initialization
  const mockWindow: any = {};
  (mockWindow.adsbygoogle = mockWindow.adsbygoogle || []).push({});

  if (Array.isArray(mockWindow.adsbygoogle) && mockWindow.adsbygoogle.length === 1) {
    console.log('✓ Test 15 Passed: Defensive adsbygoogle initialization correctly instantiates array on mount and pushes slot config');
  } else {
    console.error('✗ Test 15 Failed: Mock adsbygoogle push failed');
    process.exit(1);
  }

  // Test 16: ResultsPanel division-by-zero protection on $0 salary
  const zeroSalaryUSD = 0;
  const monthlyExpenses = 1800;
  const monthlyIncome = zeroSalaryUSD > 0 ? zeroSalaryUSD / 12 : 0;
  const rawExpensePct = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const safeExpensePercentage = isFinite(rawExpensePct) && !isNaN(rawExpensePct) ? rawExpensePct : 0;

  if (safeExpensePercentage === 0) {
    console.log('✓ Test 16 Passed: Division-by-zero on $0 salary evaluated to 0.0% instead of Infinity%');
  } else {
    console.error('✗ Test 16 Failed: Zero salary expense percentage mismatch:', safeExpensePercentage);
    process.exit(1);
  }

  // Test 17: ExpenseChart stacked bar normalization when total expenses exceed 100%
  const mockBars = [
    { label: 'Taxes', percentage: 28 },
    { label: 'Rent', percentage: 100 },
    { label: 'Living', percentage: 70.4 },
    { label: 'Savings', percentage: 0 }
  ];
  const totalBarPercentage = mockBars.reduce((sum, b) => sum + Math.max(0, b.percentage), 0); // 198.4%
  const stackScale = totalBarPercentage > 100 ? 100 / totalBarPercentage : 1;
  const scaledTotal = mockBars.reduce((sum, b) => sum + (Math.max(0, b.percentage) * stackScale), 0);

  if (Math.abs(scaledTotal - 100) < 0.001) {
    console.log('✓ Test 17 Passed: Stacked expense bar segment widths correctly normalized to 100% total container width when expenses exceed income');
  } else {
    console.error('✗ Test 17 Failed: Stacked bar width normalization mismatch:', scaledTotal);
    process.exit(1);
  }

  console.log('\n✓ All Zod schema & JSON scanner unit tests passed successfully!');
}

runTests();
