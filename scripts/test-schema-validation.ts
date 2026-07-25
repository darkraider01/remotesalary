import { CountryDataZodSchema, CurrencyRatesZodSchema } from './schemas';

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

  console.log('\n✓ All Zod schema unit tests passed successfully!');
}

runTests();
