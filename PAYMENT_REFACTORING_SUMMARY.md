# Payment System Refactoring Summary

## ✅ Completed Changes

### 1. Database Schema Updates

**Removed Old Fields:**
- Removed `isTurbo`, `isSuperTurbo`, and `boostUntil` from `Listing` model
- These were replaced with the flexible `ListingBoost` model

**New Models Added:**
- **ListingBoost**: Tracks all visibility products (Feature Listing, Category Boost, Blog Post Pin, Story Highlight)
- **CreditPackage**: Configuration table for credit packages (Starter, Standard, Pro Pack, VIP Bulk)

**Updated Models:**
- **ContentItem**: Added `priceCredits` and `isPremium` fields for VOD videos and premium posts
- **BlogPost**: Added `priceCredits` and `isPremium` fields for premium blog posts
- **SubscriptionType**: Added `PRO_MAX` and `PREMIUM_CREATOR_VIEW` tiers
- **TransactionType**: Added `VOD_UNLOCK`, `BLOG_ACCESS`, `CONTEST_ENTRY`, `FORUM_ACCESS`, `BOOST_PURCHASE`

### 2. Payment Processor Service

**Created:** `/src/lib/services/paymentProcessor.ts`
- Unified interface for payment processing
- Abstracted away from Stripe-specific code
- Ready for high-risk payment processor integration (Segpay, PaymentCloud, CCBill)
- Placeholder implementations with clear TODO comments

**Methods:**
- `createSubscription()` - For recurring subscriptions (Pro plans)
- `createOneTimeCharge()` - For one-time purchases (credits, boosts)
- `verifyWebhook()` - For webhook signature verification
- `getPaymentStatus()` - For payment status checks

### 3. Refactored Checkout Routes

**Updated Routes:**
- `/api/checkout/pro` - Now uses `paymentProcessor.createSubscription()`
- `/api/checkout/turbo` - Now uses `paymentProcessor.createOneTimeCharge()` and supports new `ListingBoost` model
- `/api/checkout/credits` - Now uses `paymentProcessor.createOneTimeCharge()` with new credit packages

**New Purchase Routes:**
- `/api/purchase/vod` - Client purchases VOD video unlock with credits
- `/api/purchase/boost` - Provider purchases visibility boosts with credits

### 4. Pricing Page Updates

**Updated Credit Packages:**
- Replaced old packages (10, 25, 50 credits) with new tiered structure:
  - **Starter**: $25 for 250 credits ($0.10/credit)
  - **Standard**: $50 for 550 credits ($0.091/credit, 8.8% discount)
  - **Pro Pack**: $100 for 1,200 credits ($0.083/credit, 17% discount)
  - **VIP Bulk**: $250 for 3,250 credits ($0.077/credit, 23% discount)

**Updated Payment Methods Text:**
- Changed from "Stripe" to "processadores de pagamento especializados"

## 🔧 Next Steps (To Complete Integration)

### 1. Configure Payment Processor

**Environment Variables Needed:**
```env
PAYMENT_PROCESSOR=segpay  # or paymentcloud, ccbill, etc.
PAYMENT_PROCESSOR_API_KEY=your_api_key
PAYMENT_PROCESSOR_API_SECRET=your_api_secret
PAYMENT_PROCESSOR_BASE_URL=https://api.processor.com
```

### 2. Implement Payment Processor API Calls

**File:** `/src/lib/services/paymentProcessor.ts`

Replace placeholder implementations with actual API calls:
- `createSubscription()` - Use processor's recurring billing API
- `createOneTimeCharge()` - Use processor's one-time payment API
- `verifyWebhook()` - Implement signature verification
- `getPaymentStatus()` - Implement status check API

### 3. Create Webhook Handler

**New Route:** `/api/webhooks/payment`

Handle payment processor webhooks:
- Subscription created/updated/cancelled
- Payment succeeded/failed
- Update database accordingly

### 4. Seed Credit Packages

Run a migration or script to populate `CreditPackage` table with the 4 packages:
- Starter (250 credits, $25)
- Standard (550 credits, $50)
- Pro Pack (1,200 credits, $100)
- VIP Bulk (3,250 credits, $250)

### 5. Update Boost Purchase Logic

When a boost is purchased via `/api/checkout/turbo`, create a `ListingBoost` record instead of updating `isTurbo`/`isSuperTurbo` fields.

### 6. Update Listing Queries

Modify profile/listing queries to:
- Check for active `ListingBoost` records instead of `isTurbo`/`isSuperTurbo`
- Sort boosted listings first based on boost type and end date

## 📊 Credit Pricing Strategy

**Anchor Price:** 1 Credit = $0.10 USD

**Client Purchases (Credit Ranges):**
- Paid Chat Message: 5-15 credits ($0.50-$1.50)
- Paid Direct Call: 30-60 credits/min ($3.00-$6.00/min)
- VOD Video Unlock: 200-1,000 credits ($20-$100)
- Tipping: 50+ credits minimum ($5+)
- Custom Gift: Variable (500+ credits, $50+)
- Premium Blog Post: 100-300 credits ($10-$30)
- Contest Entry: 25-50 credits ($2.50-$5.00)
- Premium Forum Access: 1,000 credits/month ($100/month)

**Provider Purchases (Credit Ranges):**
- Feature Listing Spot (1 hour): 500-1,500 credits
- Category Boost (24 hours): 1,000-3,000 credits
- Main Category Boost (7 days): 5,000-10,000 credits
- Blog Post Pin (7 days): 1,500-3,000 credits
- Story Highlight (24 hours): 500-1,000 credits

## 🔐 Security Notes

1. **Webhook Verification**: Always verify webhook signatures before processing
2. **Atomic Transactions**: Use Prisma transactions for credit deduction and record creation
3. **Credit Balance Checks**: Always verify sufficient credits before processing
4. **Ownership Verification**: Verify user owns listing/blog post before allowing boost purchases

## 📝 Migration Notes

- Old `isTurbo` and `isSuperTurbo` data was lost during migration (accepted with `--accept-data-loss`)
- Existing active boosts need to be migrated to `ListingBoost` records if needed
- Subscription data remains intact

