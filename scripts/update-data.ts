import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import {
  Country,
  CountryData,
  CountryDataZodSchema,
  countryDataResponseSchema,
  CurrencyRatesZodSchema,
  currencyRatesResponseSchema,
  extractAndParseJSON
} from './schemas';

config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY;

if (!geminiApiKey) {
  console.error('Error: GEMINI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Starting data update...\n');

  const countriesPath = path.join(process.cwd(), 'public/data/countries.json');
  const countries: Country[] = JSON.parse(await fs.readFile(countriesPath, 'utf-8'));

  console.log(`Found ${countries.length} countries\n`);

  // Load all 4 baseline files at startup for consistent retention behavior
  const currencyPath = path.join(process.cwd(), 'public/data/currency_rates.json');
  const rentPath = path.join(process.cwd(), 'public/data/rent_index.json');
  const colPath = path.join(process.cwd(), 'public/data/cost_of_living.json');
  const taxPath = path.join(process.cwd(), 'public/data/taxes.json');

  let currencyData: Record<string, any> = {};
  let rentData: Record<string, any> = {};
  let colData: Record<string, any> = {};
  let taxData: Record<string, any> = {};

  try {
    currencyData = JSON.parse(await fs.readFile(currencyPath, 'utf-8'));
  } catch (e) {
    console.warn('Warning: Could not load existing currency_rates.json baseline');
  }
  try {
    rentData = JSON.parse(await fs.readFile(rentPath, 'utf-8'));
  } catch (e) {
    console.warn('Warning: Could not load existing rent_index.json baseline');
  }
  try {
    colData = JSON.parse(await fs.readFile(colPath, 'utf-8'));
  } catch (e) {
    console.warn('Warning: Could not load existing cost_of_living.json baseline');
  }
  try {
    taxData = JSON.parse(await fs.readFile(taxPath, 'utf-8'));
  } catch (e) {
    console.warn('Warning: Could not load existing taxes.json baseline');
  }

  let hasFailures = false;

  // 1. Currency Rates
  console.log('1. Fetching currency rates...');
  const currencies = Array.from(new Set(countries.map(c => c.currency)));
  try {
    currencyData = await fetchCurrencyRates(currencies);
    console.log('  ✓ Currency rates updated successfully\n');
  } catch (error: any) {
    hasFailures = true;
    console.error('  ✗ Currency rates update failed:\n', error.message);
    if (currencyData && currencyData.rates) {
      console.log('    -> Retained existing baseline data for currency rates');
    } else {
      console.error('    -> CRITICAL: No existing currency baseline data available');
    }
  }

  await delay(2000);

  // 2. Rent, COL, Tax data
  console.log('2. Fetching rent, cost of living, and tax data...');

  for (const country of countries) {
    console.log(`  Processing ${country.code} (${country.name})...`);

    try {
      const data = await fetchCountryData(country);
      rentData[country.code] = data.rent;
      colData[country.code] = { index: data.col.index, description: data.col.desc };
      taxData[country.code] = { effectiveRate: data.tax.rate, description: data.tax.desc };
      console.log(`  ✓ ${country.code} complete`);
    } catch (error: any) {
      hasFailures = true;
      console.error(`  ✗ ${country.code} failed:\n`, error.message);
      if (rentData[country.code]) {
        console.log(`    -> Retained existing baseline data for ${country.code}`);
      } else {
        console.error(`    -> CRITICAL: No existing baseline data available for ${country.code}`);
      }
    }

    await delay(15000); // 15 second delay between requests to avoid rate limits
  }

  if (hasFailures) {
    console.error('\n✗ Data update completed with errors! Retained existing baseline for failed items.');
    console.error('Aborting file write to exit with failure and protect production data.');
    process.exit(1);
  }

  await fs.writeFile(currencyPath, JSON.stringify(currencyData, null, 2));
  await fs.writeFile(rentPath, JSON.stringify(rentData, null, 2));
  await fs.writeFile(colPath, JSON.stringify(colData, null, 2));
  await fs.writeFile(taxPath, JSON.stringify(taxData, null, 2));

  console.log('\n✓ All data updated successfully!');
  console.log(`Last updated: ${new Date().toISOString()}`);
}

async function fetchCurrencyRates(currencies: string[]) {
  if (exchangeRateApiKey) {
    try {
      const url = `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ExchangeRate-API HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      const rates: Record<string, number> = { USD: 1.0 };
      for (const currency of currencies) {
        if (data.conversion_rates[currency]) {
          rates[currency] = data.conversion_rates[currency];
        }
      }

      return {
        base: 'USD',
        rates,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    } catch (error: any) {
      console.log(`  ⚠ ExchangeRate-API failed (${error.message}), attempting AI fallback...`);
    }
  }

  // AI fallback
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: currencyRatesResponseSchema
    }
  });

  const prompt = `Provide current exchange rates for: ${currencies.join(', ')} relative to base USD.`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const validated = extractAndParseJSON(rawText, CurrencyRatesZodSchema);

  const ratesMap: Record<string, number> = { USD: 1.0 };
  for (const item of validated.rates) {
    ratesMap[item.currency] = item.rate;
  }

  return {
    base: validated.base,
    rates: ratesMap,
    lastUpdated: validated.lastUpdated
  };
}

export async function fetchCountryData(country: Country): Promise<CountryData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: countryDataResponseSchema
    }
  });

  const prompt = `For ${country.name} (capital: ${country.capital}), calculate current tax rate for an $85k USD earner, rent indices where baseline 100=$1000/month (for capital, tier1, and tier2 cities), and cost of living index where baseline 100=$800/month excluding rent.`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  return extractAndParseJSON(rawText, CountryDataZodSchema);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
