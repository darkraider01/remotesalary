import { SchemaType } from '@google/generative-ai';
import { z } from 'zod';

/**
 * API Integration Layer
 * Centralized clients for all external data sources
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CurrencyRatesResponse {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface NumbeoRentResponse {
  capital: number;
  tier1: number;
  tier2: number;
}

export interface NumbeoCOLResponse {
  index: number;
  description: string;
}

export interface TaxDataResponse {
  effectiveRate: number;
  description: string;
}

// ============================================================================
// EXCHANGERATE-API CLIENT
// ============================================================================

/**
 * Fetch currency rates from ExchangeRate-API
 * @param apiKey - ExchangeRate-API key
 * @param currencies - List of currency codes to fetch
 */
export async function fetchCurrencyRates(
  apiKey: string,
  currencies: string[]
): Promise<CurrencyRatesResponse> {
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`ExchangeRate-API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Filter to only requested currencies
  const rates: Record<string, number> = { USD: 1.0 };
  for (const currency of currencies) {
    if (data.conversion_rates[currency]) {
      rates[currency] = data.conversion_rates[currency];
    }
  }
  
  return {
    base: 'USD',
    rates,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

// ============================================================================
// NUMBEO API CLIENT
// ============================================================================

/**
 * Fetch rent data from Numbeo API
 * @param apiKey - Numbeo API key
 * @param city - Capital city name
 * @param country - Country name
 */
export async function fetchNumbeoRent(
  apiKey: string,
  city: string,
  country: string
): Promise<NumbeoRentResponse> {
  // Numbeo API endpoint for city prices
  const url = `https://www.numbeo.com/api/city_prices?api_key=${apiKey}&query=${city},${country}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Numbeo API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Extract rent data from Numbeo response
  // Numbeo returns "Apartment (1 bedroom) in City Centre" price
  const rentInCityCentre = data.prices?.find(
    (p: any) => p.item_name?.includes('Apartment (1 bedroom) in City Centre')
  )?.average_price;
  
  if (!rentInCityCentre) {
    throw new Error('Rent data not available from Numbeo');
  }
  
  // Calculate index (baseline: 100 = $1000/month)
  const capitalIndex = Math.round((rentInCityCentre / 1000) * 100);
  
  // Estimate tier1 and tier2 based on capital
  // Tier1: ~70% of capital, Tier2: ~50% of capital
  const tier1Index = Math.round(capitalIndex * 0.7);
  const tier2Index = Math.round(capitalIndex * 0.5);
  
  return {
    capital: capitalIndex,
    tier1: tier1Index,
    tier2: tier2Index,
  };
}

/**
 * Fetch cost of living data from Numbeo API
 * @param apiKey - Numbeo API key
 * @param city - Capital city name
 * @param country - Country name
 */
export async function fetchNumbeoCOL(
  apiKey: string,
  city: string,
  country: string
): Promise<NumbeoCOLResponse> {
  // Numbeo API endpoint for indices
  const url = `https://www.numbeo.com/api/indices?api_key=${apiKey}&query=${city},${country}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Numbeo API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Numbeo returns cost of living index (excluding rent)
  // Their baseline is different, so we need to normalize
  const numbeoCOLIndex = data.cpi_index || data.cost_of_living_index;
  
  if (!numbeoCOLIndex) {
    throw new Error('Cost of living data not available from Numbeo');
  }
  
  // Numbeo uses NYC as 100, we use $800/month as 100
  // Approximate conversion: Numbeo 100 ≈ our 150
  const ourIndex = Math.round((numbeoCOLIndex / 100) * 150);
  
  // Generate description based on index
  let description = '';
  if (ourIndex < 60) {
    description = 'Very low cost, highly affordable for all categories.';
  } else if (ourIndex < 100) {
    description = 'Low to moderate cost, affordable living.';
  } else if (ourIndex < 140) {
    description = 'Moderate to high cost, typical for developed nations.';
  } else if (ourIndex < 180) {
    description = 'High cost, particularly for services and imported goods.';
  } else {
    description = 'Very high cost, among the most expensive globally.';
  }
  
  return {
    index: ourIndex,
    description,
  };
}

// Zod Schemas for Runtime Validation
const TaxDataZodSchema = z.object({
  effectiveRate: z.number().min(0).max(1),
  description: z.string().min(1)
});

const NumbeoRentZodSchema = z.object({
  capital: z.number().positive(),
  tier1: z.number().positive(),
  tier2: z.number().positive()
});

const NumbeoCOLZodSchema = z.object({
  index: z.number().positive(),
  description: z.string().min(1)
});

// ============================================================================
// GEMINI AI CLIENT
// ============================================================================

/**
 * Fetch tax data using Gemini AI
 * @param genAI - GoogleGenerativeAI instance
 * @param countryName - Country name
 * @param countryCode - Country code
 */
export async function fetchTaxDataAI(
  genAI: any,
  countryName: string,
  countryCode: string
): Promise<TaxDataResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          effectiveRate: {
            type: SchemaType.NUMBER,
            description: 'Effective tax rate as decimal between 0 and 1'
          },
          description: {
            type: SchemaType.STRING,
            description: 'Description of tax components'
          }
        },
        required: ['effectiveRate', 'description']
      }
    }
  });
  
  const prompt = `You are a tax policy expert. Calculate the effective tax rate for ${countryName} (${countryCode}) as of ${new Date().toISOString().split('T')[0]} for a single professional earning $85,000 USD equivalent annually. Include federal income tax, mandatory social security, and health contributions minus standard deductions.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  const data = JSON.parse(text);
  const validated = TaxDataZodSchema.parse(data);
  
  return {
    effectiveRate: validated.effectiveRate,
    description: validated.description,
  };
}

// ============================================================================
// FALLBACK HANDLERS
// ============================================================================

/**
 * Fetch rent data with AI fallback
 */
export async function fetchRentWithFallback(
  numbeoApiKey: string | undefined,
  genAI: any,
  city: string,
  country: string,
  countryCode: string
): Promise<NumbeoRentResponse> {
  // Try Numbeo API first
  if (numbeoApiKey) {
    try {
      console.log(`  → Fetching rent from Numbeo API for ${city}...`);
      return await fetchNumbeoRent(numbeoApiKey, city, country);
    } catch (error) {
      console.log(`  ⚠ Numbeo API failed for ${city}, using AI fallback`);
    }
  }
  
  // Fallback to AI
  console.log(`  → Using AI for rent data (${city})`);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          capital: {
            type: SchemaType.NUMBER,
            description: 'Rent index in capital city center (100 = $1000/month baseline)'
          },
          tier1: {
            type: SchemaType.NUMBER,
            description: 'Rent index in major secondary cities (100 = $1000/month baseline)'
          },
          tier2: {
            type: SchemaType.NUMBER,
            description: 'Rent index in smaller cities and suburbs (100 = $1000/month baseline)'
          }
        },
        required: ['capital', 'tier1', 'tier2']
      }
    }
  });
  
  const prompt = `Provide monthly rent indices for ${country} (capital: ${city}) as of ${new Date().toISOString().split('T')[0]} for typical 1-bedroom apartments. Baseline: 100 = $1,000 USD/month.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  const data = JSON.parse(text);
  return NumbeoRentZodSchema.parse(data);
}

/**
 * Fetch COL data with AI fallback
 */
export async function fetchCOLWithFallback(
  numbeoApiKey: string | undefined,
  genAI: any,
  city: string,
  country: string,
  countryCode: string
): Promise<NumbeoCOLResponse> {
  // Try Numbeo API first
  if (numbeoApiKey) {
    try {
      console.log(`  → Fetching COL from Numbeo API for ${city}...`);
      return await fetchNumbeoCOL(numbeoApiKey, city, country);
    } catch (error) {
      console.log(`  ⚠ Numbeo API failed for ${city}, using AI fallback`);
    }
  }
  
  // Fallback to AI
  console.log(`  → Using AI for COL data (${city})`);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          index: {
            type: SchemaType.NUMBER,
            description: 'Cost of living index excluding rent (100 = $800/month baseline)'
          },
          description: {
            type: SchemaType.STRING,
            description: 'Description of cost of living tier'
          }
        },
        required: ['index', 'description']
      }
    }
  });
  
  const prompt = `Provide cost of living index excluding rent for ${country} as of ${new Date().toISOString().split('T')[0]} for a single professional. Baseline: 100 = $800 USD/month. Include groceries, transport, utilities, entertainment, and healthcare.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  const data = JSON.parse(text);
  return NumbeoCOLZodSchema.parse(data);
}
