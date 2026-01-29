'use client';

import { Lifestyle, LIFESTYLE_LABELS, LIFESTYLE_MULTIPLIERS } from '@/types';

interface LifestyleSliderProps {
  lifestyle: Lifestyle;
  onLifestyleChange: (lifestyle: Lifestyle) => void;
}

const lifestyles: Lifestyle[] = ['frugal', 'balanced', 'premium'];

const lifestyleDescriptions: Record<Lifestyle, string> = {
  frugal: 'Minimalist spending, maximum savings',
  balanced: 'Comfortable lifestyle, moderate spending',
  premium: 'Higher quality of life, more spending',
};

const lifestyleIcons: Record<Lifestyle, string> = {
  frugal: '💰',
  balanced: '⚖️',
  premium: '✨',
};

export function LifestyleSlider({
  lifestyle,
  onLifestyleChange,
}: LifestyleSliderProps) {
  const currentIndex = lifestyles.indexOf(lifestyle);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">
          Lifestyle
        </span>
        <span className="text-xs text-slate-500">
          Multiplier: {LIFESTYLE_MULTIPLIERS[lifestyle]}x
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative mb-4">
        <div className="h-2 bg-slate-800/50 rounded-full border border-slate-700/30">
          <div
            className="absolute h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / (lifestyles.length - 1)) * 100}%` }}
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
          {lifestyles.map((l, index) => (
            <button
              key={l}
              onClick={() => onLifestyleChange(l)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                        ${
                          index <= currentIndex
                            ? 'bg-violet-600 border-violet-400 shadow-lg shadow-violet-500/30'
                            : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                        }`}
              style={{ transform: 'translateX(-50%)', marginLeft: index === 0 ? '12px' : index === lifestyles.length - 1 ? '-12px' : '0' }}
            >
              {index <= currentIndex && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lifestyle Cards */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {lifestyles.map((l) => (
          <button
            key={l}
            onClick={() => onLifestyleChange(l)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
              lifestyle === l
                ? 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border-violet-500/50'
                : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl mb-1">{lifestyleIcons[l]}</span>
            <span
              className={`text-sm font-medium ${
                lifestyle === l ? 'text-violet-300' : 'text-slate-400'
              }`}
            >
              {LIFESTYLE_LABELS[l]}
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-center text-xs text-slate-500 mt-3">
        {lifestyleDescriptions[lifestyle]}
      </p>
    </div>
  );
}
