'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How accurate are the tax calculations?',
    answer:
      'Our calculator uses effective average tax rates for each country. These are simplified estimates and may not account for all deductions, credits, or specific tax situations. For accurate tax planning, consult a qualified tax professional in your target country.',
  },
  {
    question: 'What does the Savings Score mean?',
    answer:
      'The Savings Score (0-100) represents the percentage of your gross annual income that remains as disposable income after taxes and living expenses. A score of 40+ is considered good, meaning you can save 40% or more of your gross income.',
  },
  {
    question: 'How are rent indices calculated?',
    answer:
      'Rent indices use 100 as a baseline representing $1,000/month. A rent index of 250 means average rent is $2,500/month for that city tier. Capital cities typically have higher indices than tier-1 and tier-2 cities.',
  },
  {
    question: 'What lifestyle multiplier should I choose?',
    answer:
      'Frugal (0.8x) suits minimalist living with home cooking and limited entertainment. Balanced (1.0x) represents average spending on dining, transport, and leisure. Premium (1.3x) accounts for higher-end dining, entertainment, and travel.',
  },
  {
    question: 'Are healthcare costs included in living expenses?',
    answer:
      'Basic healthcare costs are factored into the cost of living index. However, premium health insurance or significant medical needs may require additional budget. We recommend researching healthcare options in your target country.',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Our cost of living and rent data is updated quarterly based on global indices. Tax rates are reviewed annually. For the most current rates, especially for tax planning, verify with official government sources.',
  },
  {
    question: 'Can I use this calculator for digital nomad planning?',
    answer:
      'Yes! This calculator is ideal for digital nomads comparing destinations. It helps you understand which countries offer the best balance of low costs, reasonable taxes, and high savings potential for your income level.',
  },
  {
    question: 'Why are all calculations shown in USD?',
    answer:
      'USD serves as a universal baseline for comparison. All currencies are converted to USD using current exchange rates, allowing accurate comparison across countries regardless of your input currency.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate FAQ schema for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mt-12">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold text-white mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-slate-700/30 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <span className="font-medium text-white pr-4">{item.question}</span>
              <svg
                className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                suppressHydrationWarning
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <p className="p-5 pt-0 text-slate-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
