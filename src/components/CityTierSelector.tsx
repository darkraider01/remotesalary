'use client';

import { CityTier, CITY_TIER_LABELS } from '@/types';

interface CityTierSelectorProps {
  selectedTier: CityTier;
  onTierChange: (tier: CityTier) => void;
}

const tiers: CityTier[] = ['capital', 'tier1', 'tier2'];

const tierDescriptions: Record<CityTier, string> = {
  capital: 'Major metropolitan hub',
  tier1: 'Large city, lower cost',
  tier2: 'Smaller city, lowest cost',
};

export function CityTierSelector({
  selectedTier,
  onTierChange,
}: CityTierSelectorProps) {
  return (
    <div>
      <span className="text-sm font-medium text-slate-300 mb-3 block">
        City Tier
      </span>
      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => onTierChange(tier)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border
                      transition-all duration-200 ${
                        selectedTier === tier
                          ? 'bg-violet-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10'
                          : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50'
                      }`}
          >
            <span
              className={`text-sm font-semibold ${
                selectedTier === tier ? 'text-violet-300' : 'text-slate-300'
              }`}
            >
              {CITY_TIER_LABELS[tier]}
            </span>
            <span
              className={`text-xs mt-1 ${
                selectedTier === tier ? 'text-violet-400/70' : 'text-slate-500'
              }`}
            >
              {tierDescriptions[tier]}
            </span>
            {selectedTier === tier && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-slate-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
