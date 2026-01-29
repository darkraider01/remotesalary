import { Calculator } from '@/components/Calculator';
import { SEOContent } from '@/components/SEOContent';
import { FAQ } from '@/components/FAQ';

import countriesData from '../../public/data/countries.json';
import taxesData from '../../public/data/taxes.json';
import rentIndexData from '../../public/data/rent_index.json';
import costOfLivingData from '../../public/data/cost_of_living.json';
import currencyRatesData from '../../public/data/currency_rates.json';
import {
  Country,
  TaxDataMap,
  RentIndexMap,
  CostOfLivingMap,
  CurrencyRates,
} from '@/types';

export default function Home() {
  // Type assertions for imported JSON
  const countries = countriesData as Country[];
  const taxes = taxesData as TaxDataMap;
  const rentIndex = rentIndexData as RentIndexMap;
  const costOfLiving = costOfLivingData as CostOfLivingMap;
  const currencyRates = currencyRatesData as CurrencyRates;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <span className="font-bold text-lg text-white hidden sm:block">
                RemoteSalary
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="#calculator"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Calculator
              </a>
              <a
                href="#faq"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                FAQ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Remote Salary & Cost-of-Living Calculator{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                (2026)
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Discover your real disposable income across 15 countries. Compare taxes,
              rent, living costs, and find where your money goes furthest.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                15 Countries
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Real-time Calculations
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
                100% Free
              </div>
            </div>
          </div>


        </section>

        {/* Calculator Section */}
        <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Calculator
            countries={countries}
            taxData={taxes}
            rentIndexData={rentIndex}
            costOfLivingData={costOfLiving}
            currencyRates={currencyRates}
          />
        </section>


        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SEOContent />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FAQ />
        </section>


      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌍</span>
                <span className="font-bold text-white">RemoteSalary</span>
              </div>
              <p className="text-sm text-slate-500">
                Helping remote workers make informed decisions about where to live and work.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#calculator" className="hover:text-white transition-colors">
                    Salary Calculator
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="https://github.com/darkraider01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <span>GitHub</span>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:ishanghosh0111@gmail.com"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <span>Email Me</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h4 className="font-semibold text-white mb-4">Disclaimer</h4>
              <p className="text-xs text-slate-500">
                This calculator provides estimates based on averaged data. Tax rates
                and cost of living can vary significantly based on individual
                circumstances. Consult professionals for accurate financial planning.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © 2026 RemoteSalary. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
