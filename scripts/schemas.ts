import { SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import type { Country } from '../src/types';

export type { Country };

// ============================================================================
// COUNTRY DATA SCHEMAS
// ============================================================================

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

export const countryDataResponseSchema = {
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

// ============================================================================
// CURRENCY RATES SCHEMAS
// ============================================================================

export const CurrencyRatesZodSchema = z.object({
  base: z
    .string()
    .transform(b => b.trim().toUpperCase())
    .pipe(z.literal('USD')),
  rates: z
    .array(
      z.object({
        currency: z
          .string()
          .transform(c => c.trim().toUpperCase())
          .pipe(z.string().regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter uppercase ISO code')),
        rate: z.number().positive('Exchange rate must be positive')
      })
    )
    .min(1),
  lastUpdated: z.string().min(1)
});

export type CurrencyRatesData = z.infer<typeof CurrencyRatesZodSchema>;

export const currencyRatesResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    base: { type: SchemaType.STRING, description: 'Base currency code, e.g. USD' },
    rates: {
      type: SchemaType.ARRAY,
      description: 'List of exchange rates for currencies relative to base USD',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          currency: { type: SchemaType.STRING, description: '3-letter currency code, e.g. EUR, GBP, INR' },
          rate: { type: SchemaType.NUMBER, description: 'Exchange rate relative to base USD' }
        },
        required: ['currency', 'rate']
      }
    },
    lastUpdated: { type: SchemaType.STRING, description: 'Date in YYYY-MM-DD format' }
  },
  required: ['base', 'rates', 'lastUpdated']
};

// ============================================================================
// PARSING & VALIDATION UTILITIES
// ============================================================================

/**
 * Format Zod validation errors cleanly into path-level diagnostic strings for build logs
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map(issue => `  - ${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n');
}

/**
 * Scans rawText to find the first complete JSON object ({...}) or array ([...])
 * taking into account string literals and escape characters.
 */
export function extractFirstJSONString(rawText: string): string | null {
  const startIdx = rawText.search(/[\{\[]/);
  if (startIdx === -1) return null;

  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (let i = startIdx; i < rawText.length; i++) {
    const char = rawText[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}' || char === ']') {
      if (stack.length === 0) return null;
      const last = stack.pop();
      if ((char === '}' && last !== '{') || (char === ']' && last !== '[')) {
        return null;
      }

      if (stack.length === 0) {
        return rawText.slice(startIdx, i + 1);
      }
    }
  }

  return null;
}

/**
 * Robust JSON extractor that strips markdown fences, uses depth-balanced scanning to extract outer JSON,
 * and validates with Zod schema.
 */
export function extractAndParseJSON<T>(rawText: string, schema: z.ZodType<T>): T {
  let cleaned = rawText.trim();
  // Strip markdown code fences (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find depth-balanced JSON payload
  const extracted = extractFirstJSONString(cleaned);
  if (extracted) {
    cleaned = extracted;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr: any) {
    throw new Error(`JSON parse failure: ${parseErr.message}\nRaw Output Snippet: "${rawText.slice(0, 150)}..."`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const formatted = formatZodError(result.error);
    throw new Error(`Zod Schema Validation Failure:\n${formatted}`);
  }

  return result.data;
}
