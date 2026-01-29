'use client';

export function SEOContent() {
  return (
    <section className="mt-16 pt-12 border-t border-slate-700/30">
      {/* Best Countries Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Best Countries for Remote Workers in 2026
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed mb-6">
            Choosing the right country to live and work remotely can significantly impact your 
            financial well-being. The ideal destination balances low tax rates, affordable 
            cost of living, and high quality of life. Here are some top considerations:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Tax-Free Havens */}
            <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏝️</span>
                <h3 className="text-lg font-semibold text-white">Tax-Free Destinations</h3>
              </div>
              <p className="text-sm text-slate-400">
                The <strong className="text-white">UAE</strong>, <strong className="text-white">Qatar</strong>, 
                and <strong className="text-white">Brunei</strong> offer zero personal income tax, 
                maximizing your take-home pay. Perfect for high earners looking to save aggressively.
              </p>
            </div>

            {/* High QoL */}
            <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏔️</span>
                <h3 className="text-lg font-semibold text-white">High Quality of Life</h3>
              </div>
              <p className="text-sm text-slate-400">
                <strong className="text-white">Switzerland</strong>, <strong className="text-white">Norway</strong>,  
                and <strong className="text-white">Luxembourg</strong> rank highest for quality of life, 
                though higher taxes and costs apply.
              </p>
            </div>

            {/* Best Value */}
            <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-lg font-semibold text-white">Best Value</h3>
              </div>
              <p className="text-sm text-slate-400">
                <strong className="text-white">India</strong> offers the lowest cost of living 
                with reasonable infrastructure. Tier-2 cities provide excellent value for 
                remote workers earning in USD or EUR.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remote Salary Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Remote Salary vs Cost of Living: What Really Matters
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed mb-4">
            Your gross salary tells only part of the story. When working remotely, 
            understanding how much you actually keep after taxes and living expenses 
            is crucial for financial planning.
          </p>

          <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-6 rounded-xl border border-violet-500/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Key Factors to Consider</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">→</span>
                <span><strong className="text-white">Effective Tax Rate</strong>: Varies from 0% (UAE) to 37% (Netherlands)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">→</span>
                <span><strong className="text-white">Rent Index</strong>: Capital cities often cost 2-3x more than tier-2 cities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">→</span>
                <span><strong className="text-white">Cost of Living</strong>: Switzerland costs 5x more than India for daily expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">→</span>
                <span><strong className="text-white">Lifestyle Choice</strong>: Frugal vs premium living can swing expenses by 50%</span>
              </li>
            </ul>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Use our calculator above to compare your actual disposable income across 
            different countries and lifestyle choices. The savings score helps you 
            understand what percentage of your income you can save — a key metric for 
            building long-term wealth while working remotely.
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          💡 Pro Tips for Remote Workers
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-sm text-slate-400">
              Consider tier-2 cities for significant savings without sacrificing connectivity.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-sm text-slate-400">
              Tax treaties may affect your obligations — consult a professional for your specific case.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-sm text-slate-400">
              Factor in visa requirements and digital nomad friendly policies when choosing a destination.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-sm text-slate-400">
              Healthcare costs vary significantly — ensure you have adequate coverage abroad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
