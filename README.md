# RemoteSalary

A production-ready, single-page web application that helps remote workers compare their salary against cost of living across 15 countries, calculate disposable income, and see a savings score.

## 🌍 Live Demo

Deploy to Vercel with one click and see your real take-home pay across countries.

## ✨ Features

- **15 Countries Supported**: US, India, Singapore, Switzerland, Netherlands, UK, Canada, UAE, Norway, Ireland, Luxembourg, Australia, Qatar, Brunei, Macao SAR
- **AI-Powered Data Updates**: Gemini 2.5 Flash automatically updates all data weekly for 100% accuracy
- **Real-time Calculations**: Instant updates as you adjust inputs
- **Savings Score**: 0-100 score showing what percentage of income you keep
- **Expense Breakdown**: Visual charts showing tax, rent, living, and savings distribution
- **SEO Optimized**: Meta tags, structured data, and content for search visibility
- **Mobile-First**: Responsive design that works on all devices
- **Monetization Ready**: Placeholders for AdSense and affiliate links

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Data**: Static JSON (no backend required)
- **Calculations**: Client-side only

## 📁 Project Structure

```
remotesalary/
├── public/
│   └── data/
│       ├── countries.json      # Country codes, names, currencies
│       ├── taxes.json          # Effective tax rates per country
│       ├── rent_index.json     # Rent indices by city tier
│       ├── cost_of_living.json # Cost of living indices
│       └── currency_rates.json # Exchange rates (USD base)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO metadata
│   │   ├── page.tsx            # Main page component
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Calculator.tsx      # Main calculator container
│   │   ├── SalaryInput.tsx     # Salary input with period/currency
│   │   ├── CountrySelector.tsx # Country dropdown
│   │   ├── CityTierSelector.tsx # Capital/Tier-1/Tier-2 selector
│   │   ├── LifestyleSlider.tsx # Frugal/Balanced/Premium slider
│   │   ├── ResultsPanel.tsx    # Financial summary display
│   │   ├── ExpenseChart.tsx    # Expense breakdown chart
│   │   ├── SavingsScore.tsx    # Savings score with ring chart
│   │   ├── SEOContent.tsx      # SEO article content
│   │   ├── FAQ.tsx             # FAQ with schema markup
│   │   └── AdPlacements.tsx    # Ad and affiliate placeholders
│   ├── hooks/
│   │   └── useCalculations.ts  # React hook for calculations
│   ├── lib/
│   │   └── calculations.ts     # Pure calculation functions
│   └── types/
│       └── index.ts            # TypeScript definitions
└── README.md
```

## 📐 Calculation Formulas

All calculations use annual USD values for consistency:

### Tax Calculation

```
annualTax = annualSalary × effectiveTaxRate
```

### Rent Calculation

```
monthlyRent = $1,000 × (rentIndex / 100)
```

- Baseline: index 100 = $1,000/month
- Capital cities have higher indices than tier-1 and tier-2

### Living Expenses

```
monthlyLiving = $800 × (costOfLivingIndex / 100) × lifestyleMultiplier
```

- Baseline: index 100 = $800/month
- Lifestyle multipliers:
  - Frugal: 0.8
  - Balanced: 1.0
  - Premium: 1.3

### Disposable Income

```
disposableIncome = annualSalary - annualTax - (monthlyRent + monthlyLiving) × 12
```

### Savings Score

```
savingsScore = clamp(round((disposableIncome / annualSalary) × 100), 0, 100)
```

- Red: < 20 (poor)
- Yellow: 20-40 (moderate)
- Green: 40+ (good)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project
cd remotesalary

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy with default settings

### Other Platforms

The app is a standard Next.js application. Deploy to any platform that supports Next.js (Netlify, Railway, AWS Amplify, etc.).

## 📊 Data Structure

### countries.json

```json
{
  "code": "US",
  "name": "United States",
  "currency": "USD",
  "region": "North America"
}
```

### taxes.json

```json
{
  "US": {
    "effectiveRate": 0.24,
    "description": "Federal + State average"
  }
}
```

### rent_index.json

```json
{
  "US": {
    "capital": 250,
    "tier1": 180,
    "tier2": 120
  }
}
```

### cost_of_living.json

```json
{
  "US": {
    "index": 120,
    "description": "High cost, varied by region"
  }
}
```

### currency_rates.json

```json
{
  "base": "USD",
  "rates": {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79
  }
}
```

## 🤖 AI-Powered Data Updates

This app includes an automated system that uses **Gemini 2.5 Flash** to update all data files weekly, ensuring 100% accurate information.

### Quick Setup

1. **Get Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. **Add to GitHub Secrets**:
   - Go to Settings → Secrets → Actions
   - Add `GEMINI_API_KEY` with your key
3. **Enable GitHub Actions**: Push to GitHub and enable workflows

### What Gets Updated

- ✅ Tax rates (all 15 countries)
- ✅ Rent indices (capital, tier-1, tier-2)
- ✅ Cost of living indices
- ✅ Currency exchange rates

### Update Schedule

- **Automatic**: Every Monday at 00:00 UTC
- **Manual**: Add API key to `.env` file and run `npm run update-data`

### Cost

**$0** - Runs entirely on free tiers (Gemini API + GitHub Actions)

📖 **Full Guide**: See [AI_DATA_UPDATE.md](./AI_DATA_UPDATE.md) for detailed setup instructions.

---

## 🔧 Customization

### Adding Countries

1. Add country to `countries.json`
2. Add tax rate to `taxes.json`
3. Add rent indices to `rent_index.json`
4. Add cost of living to `cost_of_living.json`
5. Add currency rate to `currency_rates.json` (if new currency)

### Updating Data

All data files are in `/public/data/`. Update values and rebuild.

### Monetization

Replace placeholders in `AdPlacements.tsx`:

- Add Google AdSense code
- Update affiliate links with your referral codes

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Pull requests welcome! Please ensure:

- TypeScript types are correct
- Code follows existing patterns
- SEO and accessibility are maintained

---

Built with ❤️ for remote workers everywhere.
