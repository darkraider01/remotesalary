import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY;

if (!geminiApiKey) {
  console.error('Error: GEMINI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

interface Country {
  code: string;
  name: string;
  currency: string;
  region: string;
  capital: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Starting data update...\\n');

  const countriesPath = path.join(process.cwd(), 'public/data/countries.json');
  const countries: Country[] = JSON.parse(await fs.readFile(countriesPath, 'utf-8'));

  console.log(`Found ${countries.length} countries\\n`);

  // 1. Currency Rates
  console.log('1. Fetching currency rates...');
  const currencies = Array.from(new Set(countries.map(c => c.currency)));
  const currencyData = await fetchCurrencyRates(currencies);
  await fs.writeFile(
    path.join(process.cwd(), 'public/data/currency_rates.json'),
    JSON.stringify(currencyData, null, 2)
  );
  console.log('✓ Currency rates updated\\n');

  await delay(2000);

  // 2. Rent, COL, Tax data
  console.log('2. Fetching rent, cost of living, and tax data...');
  const rentData: any = {};
  const colData: any = {};
  const taxData: any = {};

  for (const country of countries) {
    console.log(`  Processing ${country.code} (${country.name})...`);
    
    try {
      const data = await fetchCountryData(country);
      rentData[country.code] = data.rent;
      colData[country.code] = data.col;
      taxData[country.code] = data.tax;
      console.log(`  ✓ ${country.code} complete`);
    } catch (error: any) {
      console.error(`  ✗ ${country.code} failed:`, error.message);
    }

    await delay(15000); // 15 second delay between requests to avoid rate limits
  }

  await fs.writeFile(
    path.join(process.cwd(), 'public/data/rent_index.json'),
    JSON.stringify(rentData, null, 2)
  );
  await fs.writeFile(
    path.join(process.cwd(), 'public/data/cost_of_living.json'),
    JSON.stringify(colData, null, 2)
  );
  await fs.writeFile(
    path.join(process.cwd(), 'public/data/taxes.json'),
    JSON.stringify(taxData, null, 2)
  );

  console.log('\\n✓ All data updated successfully!');
  console.log(`Last updated: ${new Date().toISOString()}`);
}

async function fetchCurrencyRates(currencies: string[]) {
  if (exchangeRateApiKey) {
    try {
      const url = `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`;
      const response = await fetch(url);
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
    } catch (error) {
      console.log('  ExchangeRate-API failed, using AI...');
    }
  }

  // AI fallback
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `Current forex rates for: ${currencies.join(', ')} (base: USD). Return ONLY JSON: {"base":"USD","rates":{"USD":1.00},"lastUpdated":"${new Date().toISOString().split('T')[0]}"}`;
  
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  
  // Remove markdown code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Extract JSON if there's extra text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  
  return JSON.parse(text);
}

async function fetchCountryData(country: Country) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `For ${country.name} (capital: ${country.capital}), provide tax rate for $85K earner, rent indices where 100=$1000/month, and cost of living index where 100=$800/month.

CRITICAL: Return ONLY the JSON object below with NO markdown, NO code blocks, NO explanations:
{"tax":{"rate":0.28,"desc":"Income tax + SS"},"rent":{"capital":250,"tier1":180,"tier2":120},"col":{"index":135,"desc":"Moderate cost"}}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  
  // Remove markdown code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Extract JSON if there's extra text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  
  const data = JSON.parse(text);

  return {
    rent: data.rent,
    col: { index: data.col.index, description: data.col.desc },
    tax: { effectiveRate: data.tax.rate, description: data.tax.desc }
  };
}

main().catch(console.error);
