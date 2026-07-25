import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { z } from 'zod';

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

// Zod schema for validating Gemini output structure and value bounds
export const CountryDataZodSchema = z.object({
  tax: z.object({
    rate: z.number().min(0).max(1),
    desc: z.string().min(1)
  }),
  rent: z.object({
    capital: z.number().positive(),
    tier1: z.number().positive(),
    tier2: z.number().positive()
  }),
  col: z.object({
    index: z.number().positive(),
    desc: z.string().min(1)
  })
});

export type CountryData = z.infer<typeof CountryDataZodSchema>;

// Native Gemini responseSchema enforcing output shape at generation time
const countryDataResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    tax: {
      type: SchemaType.OBJECT,
      properties: {
        rate: {
          type: SchemaType.NUMBER,
          description: 'Effective tax rate as a decimal between 0 and 1 for an $85k USD earner'
        },
        desc: {
          type: SchemaType.STRING,
          description: 'Brief description of included tax components'
        }
      },
      required: ['rate', 'desc']
    },
    rent: {
      type: SchemaType.OBJECT,
      properties: {
        capital: {
          type: SchemaType.NUMBER,
          description: 'Rent index in capital city center, baseline 100 = $1000 USD/month'
        },
        tier1: {
          type: SchemaType.NUMBER,
          description: 'Rent index in secondary tier 1 cities, baseline 100 = $1000 USD/month'
        },
        tier2: {
          type: SchemaType.NUMBER,
          description: 'Rent index in tier 2 cities/suburbs, baseline 100 = $1000 USD/month'
        }
      },
      required: ['capital', 'tier1', 'tier2']
    },
    col: {
      type: SchemaType.OBJECT,
      properties: {
        index: {
          type: SchemaType.NUMBER,
          description: 'Cost of living index excluding rent, baseline 100 = $800 USD/month'
        },
        desc: {
          type: SchemaType.STRING,
          description: 'Cost of living summary description'
        }
      },
      required: ['index', 'desc']
    }
  },
  required: ['tax', 'rent', 'col']
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Starting data update...\n');

  const countriesPath = path.join(process.cwd(), 'public/data/countries.json');
  const countries: Country[] = JSON.parse(await fs.readFile(countriesPath, 'utf-8'));

  console.log(`Found ${countries.length} countries\n`);

  // 1. Currency Rates
  console.log('1. Fetching currency rates...');
  const currencies = Array.from(new Set(countries.map(c => c.currency)));
  const currencyData = await fetchCurrencyRates(currencies);

  // 2. Load existing Rent, COL, Tax data as baseline fallbacks
  console.log('2. Fetching rent, cost of living, and tax data...');
  const rentPath = path.join(process.cwd(), 'public/data/rent_index.json');
  const colPath = path.join(process.cwd(), 'public/data/cost_of_living.json');
  const taxPath = path.join(process.cwd(), 'public/data/taxes.json');

  let rentData: Record<string, any> = {};
  let colData: Record<string, any> = {};
  let taxData: Record<string, any> = {};

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
      console.error(`  ✗ ${country.code} failed:`, error.message);
      if (rentData[country.code]) {
        console.log(`    -> Retained existing baseline data for ${country.code}`);
      } else {
        console.error(`    -> CRITICAL: No existing baseline data available for ${country.code}`);
      }
    }

    await delay(15000); // 15 second delay between requests to avoid rate limits
  }

  if (hasFailures) {
    console.error('\n✗ Data update completed with errors! Retained existing baseline for failed countries.');
    console.error('Aborting file write to exit with failure and protect production data.');
    process.exit(1);
  }

  await fs.writeFile(
    path.join(process.cwd(), 'public/data/currency_rates.json'),
    JSON.stringify(currencyData, null, 2)
  );
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
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          base: { type: SchemaType.STRING },
          rates: { type: SchemaType.OBJECT },
          lastUpdated: { type: SchemaType.STRING }
        },
        required: ['base', 'rates', 'lastUpdated']
      }
    }
  });

  const prompt = `Current forex rates for: ${currencies.join(', ')} (base: USD).`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  return JSON.parse(text);
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
  let text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  const rawData = JSON.parse(text);
  const validated = CountryDataZodSchema.parse(rawData);

  return validated;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
