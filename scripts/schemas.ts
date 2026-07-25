import { SchemaType } from '@google/generative-ai';
import { z } from 'zod';

// ============================================================================
// COUNTRY DATA SCHEMAS
// ============================================================================

export interface Country {
  code: string;
  name: string;
  currency: string;
  region: string;
  capital: string;
}

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
  base: z.string().min(1),
  rates: z.array(
    z.object({
      currency: z.string().min(1),
      rate: z.number().positive()
    })
  ).min(1),
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
