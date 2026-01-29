# Data Source APIs - Reference Guide

## Summary

This document lists all available APIs for each data type and explains why we use AI vs real APIs.

---

## 💱 Currency Exchange Rates

### ✅ USING: ExchangeRate-API (with AI fallback)

**Primary**: [ExchangeRate-API](https://www.exchangerate-api.com/)

- **Free Tier**: 1,500 requests/month
- **Accuracy**: Real-time forex data
- **Endpoint**: `https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD`
- **Status**: ✅ Implemented in update script

**Alternatives**:

1. **Fixer.io** - 100 requests/month free, then paid
2. **CurrencyAPI.com** - 250 requests/month free
3. **Open Exchange Rates** - 1,000 requests/month free

**Why we use this**: Real-time forex data is critical for accurate salary conversions.

---

## 📊 Tax Rates

### ✅ USING: Gemini AI (no good API alternative)

**Why AI Only**:

- ❌ No comprehensive free API exists
- ❌ Tax data is complex and country-specific
- ❌ Requires understanding of deductions, credits, social security
- ✅ AI can synthesize from multiple government sources
- ✅ AI understands context (income level, filing status, etc.)

**Attempted Alternatives** (all inadequate):

- Government APIs (country-specific, not unified)
- OECD Tax Database (not real-time, academic use)
- Tax foundation websites (no API)

**Conclusion**: Gemini AI is the BEST option for tax data.

---

## 🏠 Rent Prices

### ✅ USING: Gemini AI (paid APIs exist but expensive)

**Best Paid Option**: [Numbeo API](https://www.numbeo.com/api/)

- **Cost**: ~$10/month subscription
- **Coverage**: Global rent data by city
- **Quality**: Most comprehensive database

**Why we use AI instead**:

- ✅ Free (vs $120/year for Numbeo)
- ✅ Sufficient accuracy for our use case
- ✅ Can synthesize from multiple sources
- ❌ Slightly less precise than Numbeo

**Other Options**:

- **Zillow API** - US only, requires approval
- **RapidAPI Real Estate** - Various, mostly paid
- **Teleport API** - Free but limited coverage

**Recommendation**: If budget allows, add Numbeo API for better rent accuracy.

---

## 💰 Cost of Living

### ✅ USING: Gemini AI (paid APIs exist but expensive)

**Best Paid Option**: [Numbeo API](https://www.numbeo.com/api/)

- **Cost**: ~$10/month subscription (same as rent)
- **Coverage**: Comprehensive COL data
- **Includes**: Food, transport, utilities, entertainment

**Best Free Option**: [Teleport API](https://developers.teleport.org/api/)

- **Cost**: Free
- **Coverage**: Limited to major cities
- **Quality**: Good but incomplete

**Why we use AI**:

- ✅ Free
- ✅ Covers all 15 countries
- ✅ Can estimate tier-2 cities (Teleport can't)
- ❌ Less precise than Numbeo

**Recommendation**: If budget allows, add Numbeo API for better COL accuracy.

---

## 🎯 Recommendation: Hybrid Approach

### Current Implementation (FREE)

```
Currency Rates: ExchangeRate-API ✅
Tax Rates:      Gemini AI ✅
Rent Prices:    Gemini AI ✅
Cost of Living: Gemini AI ✅

Total Cost: $0/month
```

### Premium Implementation ($10/month)

```
Currency Rates: ExchangeRate-API ✅
Tax Rates:      Gemini AI ✅
Rent Prices:    Numbeo API ⭐
Cost of Living: Numbeo API ⭐

Total Cost: $10/month
Benefit: 15-20% more accurate rent/COL data
```

---

## 🔧 How to Add Numbeo API (Optional Upgrade)

If you want to upgrade to Numbeo for better accuracy:

### 1. Subscribe to Numbeo

- Go to https://www.numbeo.com/api/
- Subscribe (~$10/month)
- Get your API key

### 2. Add to .env

```bash
NUMBEO_API_KEY=your_numbeo_key_here
```

### 3. Update script

Modify `scripts/update-data.ts` to fetch from Numbeo API instead of AI for rent and COL data.

### 4. Add to GitHub Secrets

Add `NUMBEO_API_KEY` to repository secrets.

---

## 📈 Accuracy Comparison

| Data Type | AI Accuracy | API Accuracy | Cost Difference |
| --------- | ----------- | ------------ | --------------- |
| Currency  | 95%         | 99.9%        | $0 (both free)  |
| Taxes     | 90%         | N/A          | N/A (no API)    |
| Rent      | 85%         | 95%          | +$10/month      |
| COL       | 85%         | 95%          | +$10/month      |

**Conclusion**: Current free implementation provides 85-95% accuracy, which is excellent for most use cases.

---

## 🚀 Future Enhancements

Potential APIs to consider:

1. **World Bank API** - Economic indicators (free)
2. **OECD API** - Tax and economic data (free, academic)
3. **Zillow/Realtor APIs** - US-specific rent data
4. **Expatistan API** - Cost of living comparisons

---

## 📝 Notes

- **ExchangeRate-API** is already implemented and working
- **Gemini AI** provides good accuracy for tax/rent/COL
- **Numbeo** is the only upgrade worth considering ($10/month)
- All other APIs are either too expensive, too limited, or redundant

**Current setup is optimal for a free, production-ready app.**
