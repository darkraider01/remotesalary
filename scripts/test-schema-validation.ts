import { CountryDataZodSchema, CurrencyRatesZodSchema, extractAndParseJSON } from './schemas';

function runTests() {
  console.log('Running Zod schema validation unit tests...');

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

  // Test 5: Valid currency rates
  const validCurrencyData = {
    base: 'USD',
    rates: [
      { currency: 'EUR', rate: 0.92 },
      { currency: 'GBP', rate: 0.78 }
    ],
    lastUpdated: '2026-07-25'
  };

  try {
    const result = CurrencyRatesZodSchema.parse(validCurrencyData);
    console.log('✓ Test 5 Passed: Valid currency rates parsed successfully:', result.rates.length, 'currencies');
  } catch (err: any) {
    console.error('✗ Test 5 Failed:', err.message);
    process.exit(1);
  }

  // Test 6: Invalid currency rate (non-positive)
  const invalidCurrencyData = {
    base: 'USD',
    rates: [
      { currency: 'EUR', rate: -0.92 }
    ],
    lastUpdated: '2026-07-25'
  };

  try {
    CurrencyRatesZodSchema.parse(invalidCurrencyData);
    console.error('✗ Test 6 Failed: Should have rejected negative exchange rate');
    process.exit(1);
  } catch (err: any) {
    console.log('✓ Test 6 Passed: Correctly caught negative exchange rate');
  }

  // Test 7: extractAndParseJSON with markdown code fences and surrounding text
  const markdownFencedRawOutput = `Here is the requested output:
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
    console.log('✓ Test 7 Passed: Successfully extracted JSON from markdown fences:', parsed.tax.rate);
  } catch (err: any) {
    console.error('✗ Test 7 Failed:', err.message);
    process.exit(1);
  }

  // Test 8: extractAndParseJSON formatting path-level Zod errors
  const malformedZodRawOutput = `\`\`\`json
{
  "tax": { "rate": 15.5, "desc": "Over 1.0 tax rate" },
  "rent": { "capital": -50, "tier1": 150, "tier2": 100 },
  "col": { "index": 110, "desc": "" }
}
\`\`\``;

  try {
    extractAndParseJSON(malformedZodRawOutput, CountryDataZodSchema);
    console.error('✗ Test 8 Failed: Should have thrown formatted Zod error');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('tax.rate') && err.message.includes('rent.capital')) {
      console.log('✓ Test 8 Passed: Correctly formatted path-level Zod diagnostic errors');
    } else {
      console.error('✗ Test 8 Failed with unexpected error structure:', err.message);
      process.exit(1);
    }
  }

  console.log('\n✓ All Zod schema unit tests passed successfully!');
}

runTests();
