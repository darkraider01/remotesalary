'use client';

import { useEffect, useRef } from 'react';

interface AdPlacementProps {
  slot: 'sidebar' | 'inline' | 'banner';
  adSlotId?: string; // Google AdSense Slot ID (optional for now, user needs to fill)
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdPlacement({ slot, adSlotId }: AdPlacementProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Only try to load ad if we have a slot ID and the script is loaded
    if (adSlotId && adRef.current && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adSlotId]);

  const sizes = {
    sidebar: { width: '300px', height: '250px', format: 'rectangle' },
    inline: { width: '100%', height: '90px', format: 'horizontal' },
    banner: { width: '100%', height: '100px', format: 'horizontal' },
  };

  const size = sizes[slot];
  const isDev = process.env.NODE_ENV === 'development';

  // If no Slot ID is provided, show a placeholder in Dev, nothing in Prod
  if (!adSlotId) {
    if (isDev) {
      return (
        <div
          className="flex items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/30 rounded-xl text-slate-600 text-sm"
          style={{ minHeight: size.height, width: size.width }}
        >
          <span className="text-center px-4">
            Ad Space ({slot})
            <br />
            <span className="text-xs text-slate-700">Add `adSlotId` prop to enable</span>
          </span>
        </div>
      );
    }
    return null; // Collapse in production if no ID
  }

  return (
    <div className="flex justify-center overflow-hidden my-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: size.width, minHeight: size.height }}
        data-ad-client="ca-pub-2561060401438724"
        data-ad-slot={adSlotId}
        data-ad-format={size.format} // Auto-responsive
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AffiliateLinks() {
  const affiliates = [
    {
      name: 'Wise',
      description: 'Send money abroad with low fees',
      icon: '💱',
      color: 'from-emerald-600/20 to-teal-600/20',
      borderColor: 'border-emerald-500/30',
      link: '#wise-affiliate',
    },
    {
      name: 'Deel',
      description: 'Global payroll & compliance',
      icon: '📋',
      color: 'from-blue-600/20 to-indigo-600/20',
      borderColor: 'border-blue-500/30',
      link: '#deel-affiliate',
    },
    {
      name: 'Remote.com',
      description: 'Employer of Record services',
      icon: '🌍',
      color: 'from-violet-600/20 to-purple-600/20',
      borderColor: 'border-violet-500/30',
      link: '#remote-affiliate',
    },
  ];

  return (
    <div className="mt-12 p-6 bg-slate-800/20 rounded-2xl border border-slate-700/20">
      <h3 className="text-lg font-semibold text-white mb-2">
        Recommended Tools for Remote Workers
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Trusted services to help manage your finances and employment globally.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {affiliates.map((affiliate) => (
          <a
            key={affiliate.name}
            href={affiliate.link}
            className={`block p-4 rounded-xl bg-gradient-to-br ${affiliate.color} border ${affiliate.borderColor} 
                       hover:scale-[1.02] transition-transform duration-200`}
            rel="noopener noreferrer sponsored"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{affiliate.icon}</span>
              <span className="font-semibold text-white">{affiliate.name}</span>
            </div>
            <p className="text-sm text-slate-400">{affiliate.description}</p>
            <div className="mt-3 flex items-center text-sm font-medium text-slate-300">
              Learn more
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                suppressHydrationWarning
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-4 text-center">
        * We may earn a commission from partner links. This helps support our free tools.
      </p>
    </div>
  );
}
