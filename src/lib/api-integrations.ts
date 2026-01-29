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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `You are a tax policy expert with access to current government tax databases. Provide the MOST ACCURATE effective tax rate for ${countryName} as of ${new Date().toISOString().split('T')[0]}.

DATA REQUIREMENTS:
- Source data from official government tax authority websites and current tax year regulations
- Use the latest enacted tax laws (not proposed or pending legislation)
- Calculate for a single professional earning $85,000 USD equivalent annually

INCLUDE ALL OF THE FOLLOWING:
1. Personal income tax (federal/national)
2. Social security contributions (employee portion)
3. Medicare/health insurance contributions (if mandatory)
4. State/provincial taxes (use average if applicable)
5. Standard deductions and personal allowances

EXCLUDE:
- Employer contributions
- Optional retirement contributions
- Property taxes or VAT/sales taxes

CALCULATION METHOD:
- Convert $85,000 USD to local currency using current exchange rates
- Apply progressive tax brackets accurately
- Subtract standard deductions before calculating tax
- Add mandatory social contributions
- Return as decimal (e.g., 28.5% = 0.285)

Return ONLY valid JSON with no markdown, code blocks, or explanations:
{
  "effectiveRate": 0.285,
  "description": "Income tax (X%) + Social security (Y%) + Health insurance (Z%) for $85K earner"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  const data = JSON.parse(text);
  
  return {
    effectiveRate: data.effectiveRate,
    description: data.description,
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `You are a real estate market analyst. Provide ACCURATE monthly rent data for ${country} (capital: ${city}) as of ${new Date().toISOString().split('T')[0]}.

DATA REQUIREMENTS:
- Source from current rental listings on major platforms (Zillow, Numbeo, local real estate sites)
- Use median market rates (not luxury or budget extremes)
- All prices should reflect typical 1-bedroom apartments in good condition

CITY TIER DEFINITIONS:
- Capital: ${city} city center (CBD/downtown business district)
- Tier 1: Major secondary cities (2nd-3rd largest cities, tech hubs, financial centers)
- tier 2: Smaller cities and suburban areas (regional capitals, university towns)

BASELINE CALCULATION:
- Index 100 = $1,000 USD/month
- Example: If rent is $2,500/month, index = 250
- Example: If rent is $600/month, index = 60

ACCURACY CHECKS:
- Verify prices match current market conditions (post-pandemic, 2025-2026 rates)
- Cross-reference with multiple sources
- Account for currency conversion using current exchange rates

Return ONLY valid JSON with no markdown, code blocks, or explanations:
{
  "capital": 250,
  "tier1": 180,
  "tier2": 120
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(text);
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `You are a cost of living analyst. Provide ACCURATE monthly living expenses (EXCLUDING RENT) for ${country} as of ${new Date().toISOString().split('T')[0]}.

DATA REQUIREMENTS:
- Source from consumer price databases (Numbeo, Expatistan, government statistics)
- Use median costs for a single professional living alone
- Reflect current market prices (2025-2026 data)

INCLUDE THESE CATEGORIES:
1. Food & Groceries: Supermarket shopping for one person (~$250-400/month baseline)
2. Transportation: Public transit pass or fuel/car costs (~$100-150/month baseline)
3. Utilities: Electricity, water, gas, internet for 1-bedroom apt (~$100-200/month baseline)
4. Entertainment: Dining out 2x/week, gym, streaming services (~$150-250/month baseline)
5. Healthcare: Insurance premiums or out-of-pocket costs (~$50-150/month baseline)

BASELINE CALCULATION:
- Index 100 = $800 USD/month total across all categories
- Example: If total is $1,200/month, index = 150
- Example: If total is $500/month, index = 62.5 (round to 63)

DESCRIPTION GUIDELINES:
- Index < 60: "Very low cost, highly affordable for all categories"
- Index 60-99: "Low to moderate cost, affordable living"
- Index 100-139: "Moderate to high cost, typical for developed nations"
- Index 140-179: "High cost, particularly for services and imported goods"
- Index 180+: "Very high cost, among the most expensive globally"

Return ONLY valid JSON with no markdown, code blocks, or explanations:
{
  "index": 120,
  "description": "Moderate to high cost, typical for developed nations"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(text);
}
