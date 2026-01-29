'use client';

import { Country } from '@/types';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  countries: Country[];
}

export function CountrySelector({
  selectedCountry,
  onCountryChange,
  countries,
}: CountrySelectorProps) {
  // Group countries by region
  const groupedCountries = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const regions = Object.keys(groupedCountries).sort();

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium text-slate-300 mb-2 block">
          Country
        </span>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full py-3 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl
                     text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50
                     focus:border-violet-500/50 transition-all cursor-pointer appearance-none"
          >
            {regions.map((region) => (
              <optgroup key={region} label={region} className="bg-slate-800">
                {groupedCountries[region].map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                    className="bg-slate-800 py-2"
                  >
                    {country.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400"
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
          </div>
        </div>
      </label>

      {/* Selected country info */}
      {selectedCountry && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {countries.find((c) => c.code === selectedCountry)?.name}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-500">
            {countries.find((c) => c.code === selectedCountry)?.currency}
          </span>
        </div>
      )}
    </div>
  );
}
