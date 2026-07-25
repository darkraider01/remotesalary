import { CountryDataZodSchema } from './update-data';

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

  console.log('\n✓ All Zod schema unit tests passed successfully!');
}

runTests();
