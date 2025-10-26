# Invest in Your Star - Stellar Implementation Guide

## 0) One-liner

A compliance-first launchpad where content creators tokenize a defined scope of IP (e.g., a track, album, catalog, or future release) into regulated revenue-sharing tokens and an optional stake-for-license option. Fans/investors buy and stake for cash flows; businesses stake above a threshold to unlock commercial license rights—rights automatically revoke when they unstake or sell. **MVP includes hardcoded KYC simulation accepting sample "yes/no" responses from SumSub KYC integration for testing purposes.**

Built on **Stellar** using **Scaffold Stellar** with Soroban smart contracts and React/TypeScript frontend.

---

## 1) Product & Personas

### Target Users
- **Primary**: Independent music creators (no/limited label constraints)
- **Secondary**: Music catalogs, movie makers, social influencers, podcast creators
- **Buy-side (retail)**: Fans/collectors seeking upside from future royalties
- **Buy-side (B2B)**: Brands, ad agencies, film/TV producers seeking sync or commercial licenses with on-chain attestations

### Core Value
- **Creators**: raise capital, share upside, program secondary revenue
- **Fans**: invest in specific content; receive pro-rata royalties when staked
- **Businesses**: self-serve licensing via a stake-based option with instant, revocable on-chain proof

---

## 2) Architecture Overview

### Tech Stack
- **Blockchain**: Stellar (Soroban smart contracts)
- **Smart Contracts**: Rust (compiled to WASM)
- **Frontend**: React + TypeScript + Vite
- **CLI Tools**: Stellar CLI + Scaffold Stellar
- **Network**: Futurenet (testnet) → Mainnet

### Project Structure
```
invest-in-your-star/
├── contracts/                    # Rust smart contracts
│   └── [contract-name]/
│       ├── src/
│       │   ├── lib.rs           # Contract implementation
│       │   ├── error.rs         # Custom errors
│       │   ├── events.rs        # Event definitions
│       │   └── storage.rs       # Storage keys
│       └── Cargo.toml
├── packages/                     # Auto-generated TypeScript clients
│   └── [contract-name]/
├── src/                          # React frontend
│   ├── components/
│   ├── contracts/               # Contract imports
│   ├── App.tsx
│   └── main.tsx
├── crates/                       # Internal Rust libraries
├── environments.toml             # Environment config
├── .env                          # Local env vars
├── Cargo.toml                    # Rust workspace
└── package.json                  # Frontend deps
```

---

## 3) Smart Contracts (Soroban)

### 3.1 Contracts to Build

Create these contracts in `contracts/`:

#### ContentRegistry (`contracts/content_registry/`)
- Register unique content fingerprints (ISRC, audio hash, etc.)
- Store metadata (title, creators, splits, off-chain doc hashes)
- Support parent-child relationships (albums → tracks)
- **Functions**:
  - `register(owners, fingerprint, scope_uri, rights_hash) -> content_id`
  - `get(content_id) -> ContentMeta`
  - `exists(fingerprint) -> bool`

#### ContentToken (`contracts/content_token/`)
- Permissioned fungible token (7 decimals for Stellar)
- Transfer-gated (KYC/allowlist)
- Pausable with clawback
- Role-based admin
- **Functions**:
  - `initialize(admin, name, symbol, decimals, allowlist)`
  - `set_allowlist(addr, allowed)`
  - `set_minter(addr, allowed)`
  - `pause()` / `unpause()`
  - `mint(to, amount)`
  - `transfer(from, to, amount)`

#### BondingCurveSale (`contracts/bonding_curve_sale/`)
- Linear bonding curve: `p(n) = p0 + k·n`
- Accepts USDC (Stellar asset)
- Mints CT tokens
- **Functions**:
  - `initialize(admin, token_addr, usdc_addr, treasury, base_price, slope)`
  - `quote(amount) -> cost`
  - `buy(buyer, amount)`
  - `close()`

#### StakingEscrow (`contracts/staking_escrow/`)
- Locks CT tokens for revenue distributions
- Tracks staked balances per holder
- Epoch-based (monthly)
- **Functions**:
  - `stake(holder, amount)`
  - `unstake(holder, amount)`
  - `balance_staked(holder) -> amount`
  - `epoch() -> u64`
  - `advance_epoch()` (admin)

#### RevenueDistributor (`contracts/revenue_distributor/`)
- Snapshot staked balances at epoch end
- Distribute USDC based on pro-rata stake
- Pull-based claims
- **Functions**:
  - `deposit(content_id, amount_usdc)`
  - `finalize_epoch(content_id)`
  - `claimable(holder, content_id) -> amount`
  - `claim(holder, content_id, to)`

#### LicenseManager (`contracts/license_manager/`)
- Enforces stake thresholds for licenses
- Tracks license activations
- Auto-revokes on threshold breach
- **Functions**:
  - `configure(content_id, l_threshold, d_min_secs, fee_mode)`
  - `on_stake_change(holder)` (callback from StakingEscrow)
  - `request_license(holder, content_id, license_hash)`
  - `revoke_if_below_threshold(holder, content_id)`

#### LicenseNFT (`contracts/license_nft/`)
- Soulbound NFT (non-transferable)
- On-chain license proof
- Burned on revocation/expiry
- **Functions**:
  - `mint(to, content_id, license_hash, expires_at)`
  - `burn(from, content_id)`
  - `info(owner, content_id) -> LicenseInfo`

#### OracleAttestation (`contracts/oracle_attestation/`)
- Posts signed revenue attestations
- Stores document hashes
- **Functions**:
  - `post_revenue(content_id, epoch, amount_usdc, doc_hash)`
  - `post_license_doc(content_id, license_hash, url)`

### 3.2 Contract Setup Commands

```bash
# 1. Create new contract
cd contracts
cargo new --lib content_token
cd content_token

# 2. Add to workspace Cargo.toml
# Add to members: "contracts/content_token"

# 3. Build contract
just build

# 4. Deploy
just scaffold init my-content-platform
cd my-content-platform
npm install
npm run dev  # Builds contracts and starts frontend
```

### 3.3 Environment Configuration

Edit `environments.toml`:

```toml
[development]
network = { name = "futurenet" }
accounts = ["admin", "creator", "investor"]

[development.contracts.content_registry]
client = true
constructor_args = "--admin $(stellar keys address admin)"

[development.contracts.content_token]
client = true
constructor_args = """
  --admin $(stellar keys address admin)
  --name 'ContentToken'
  --symbol 'CT'
  --decimals 7
  --allowlist true
"""

[staging]
network = { name = "testnet" }

[production]
network = { name = "mainnet" }
```

### 3.4 Access Roles (require_auth)

```rust
pub enum Role {
    ADMIN,      // Platform multisig
    CREATOR,    // Registered content owners
    COMPLIANCE, // Allowlist writer (KYC)
    ORACLE,     // Revenue attestations
}
```

### 3.5 Security Invariants

- CT transfers require allowlist
- Sale can only mint while minter[sale] = true and !closed
- Users can't claim revenue without stake at snapshot
- License active iff `staked >= threshold && time >= D_min && fees_paid`
- LNFT is non-transferable (soulbound)

---

## 4) Frontend Implementation (React + TypeScript)

### 4.1 Contract Client Generation

TypeScript clients are auto-generated:

```typescript
// src/contracts/content_token.ts
import * as Client from 'content_token';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Test SDF Future Network ; October 2022',
  contractId: 'C...',
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
```

### 4.2 Frontend Components

#### Creator Wizard (`src/components/CreatorWizard.tsx`)
- Wallet connection (Freighter)
- KYC verification
- Upload content metadata (ISRC, splits, docs)
- Configure economics (A, S, p0)
- Deploy contracts via backend API

#### Investor Interface (`src/components/InvestorDashboard.tsx`)
- View offerings
- KYC gate
- Buy tokens via bonding curve
- Stake/unstake
- Claim revenue

#### License Interface (`src/components/LicensePortal.tsx`)
- Request license terms
- View stake threshold
- Activate license (stake + sign)
- View LNFT
- Monitor auto-revocation

### 4.3 Usage Example

```typescript
import contentToken from './contracts/content_token';

// Buy tokens
const buyTokens = async (amount: bigint) => {
  const res = await contentToken.transfer({
    from: userAddress,
    to: saleAddress,
    amount,
  });
  return res;
};

// Stake for revenue
const stake = async (amount: bigint) => {
  const res = await stakingEscrow.stake({
    holder: userAddress,
    amount,
  });
  return res;
};
```

---

## 5) Backend API (REST + Stellar)

### 5.1 Authentication (SEP-10)

```typescript
POST /auth/sep10/challenge
POST /auth/sep10/verify  // Returns JWT
```

### 5.2 Content Management

```typescript
POST /creator/contents
  Body: { metadata, fingerprint, rights_hash, splits }
  Returns: { content_id }

POST /creator/offerings
  Body: { content_id, supply, base_price, target_raise }
  Returns: { token_id, sale_id }
```

### 5.3 Investor Actions

```typescript
GET  /offerings/:content_id
POST /offerings/:content_id/quote
POST /offerings/:content_id/buy
POST /stake/:content_id
POST /unstake/:content_id
GET  /revenue/:content_id/claimable
POST /revenue/:content_id/claim
```

### 5.4 Licensing

```typescript
POST /license/:content_id/request
POST /license/:content_id/activate
POST /license/:content_id/revoke
```

### 5.5 Implementation with Stellar CLI

```typescript
// Build unsigned XDR for user signing
const buildBuyTx = async (amount: bigint) => {
  const { contractId } = await fetch('/api/contracts/sale');
  const xdr = await stellar.contract.invoke({
    contractId,
    function: 'buy',
    args: [amount],
  });
  return xdr; // User signs with Freighter
};
```

---

## 6) Data Models

### Off-chain DB (PostgreSQL/Prisma)

```typescript
model User {
  id            String   @id
  wallet        String   @unique
  kycLevel      KYCLevel
  country       String
  roles         Role[]
  createdAt     DateTime
}

model Content {
  id            Int      @id
  fingerprint   String   @unique
  title         String
  scopeUri      String
  owners        String[]
  status        Status
  tokenId       String?
  saleId        String?
}

model Offering {
  contentId     Int      @id
  supply        BigInt
  basePrice     BigInt
  slope         BigInt
  targetRaise   BigInt
  usdcId        String
  tokenId       String
  saleId        String
}

model Stake {
  contentId     Int
  address       String
  amount        BigInt
  sinceEpoch    Int
  lastChange    DateTime
  @@unique([contentId, address])
}

model Epoch {
  contentId     Int
  epochId       Int
  startTime     DateTime
  endTime       DateTime
  totalStaked   BigInt
  totalDeposit  BigInt
  finalized     Boolean
  @@unique([contentId, epochId])
}

model License {
  contentId     Int
  address       String
  licenseHash   String
  lnftTokenId   BigInt?
  expiresAt     DateTime
  status        LicenseStatus
  @@unique([contentId, address])
}
```

---

## 7) Compliance & KYC

### 7.1 KYC Integration

```typescript
// Persona webhook
POST /kyc/persona/webhook
  Body: { status, userId }
  Action: Update CT allowlist
```

### 7.2 Jurisdiction Enforcement

```typescript
const enforceJurisdiction = async (wallet: string) => {
  const user = await db.user.findUnique({ where: { wallet } });
  const allowed = ALLOWED_COUNTRIES.includes(user.country);
  if (!allowed) throw new Error('Jurisdiction not supported');
};
```

### 7.3 Token Gate

```typescript
// On CT transfer
fn transfer(env: Env, from: Address, to: Address, amount: i128) {
  require_allowlist(&env, &to); // Enforced on-chain
  // ... transfer logic
}
```

---

## 8) Deployment Workflow

### 8.1 Development

```bash
# 1. Start local network (or use Futurenet)
npm run dev

# 2. Build contracts
just build

# 3. Deploy to Futurenet
just create  # Creates accounts and deploys registry

# 4. Publish contracts
just registry publish --wasm target/stellar/local/content_token.wasm

# 5. Deploy instance
just registry deploy \
  --contract-name content_token_main \
  --wasm-name content_token \
  -- \
  --admin <ADMIN_ADDR>
```

### 8.2 Staging/Production

```bash
# Set environment
export STELLAR_SCAFFOLD_ENV=production

# Deploy
just scaffold build
just registry publish ...
just registry deploy ...
```

### 8.3 Frontend Deployment

```bash
npm run build
# Deploy dist/ to Vercel/Netlify
```

---

## 9) Testing

### 9.1 Contract Tests (Rust)

```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Ledger;

    #[test]
    fn test_transfer_requires_allowlist() {
        let env = Env::default();
        let token = ContentToken::new(&env);
        
        // Set up addresses
        let from = Address::generate(&env);
        let to = Address::generate(&env);
        
        // Mint tokens
        token.mint(&from, 1000);
        
        // Transfer should fail (not allowlisted)
        assert!(token.transfer(&from, &to, 100).is_err());
        
        // Add to allowlist
        token.set_allowlist(&to, true);
        
        // Transfer should succeed
        assert!(token.transfer(&from, &to, 100).is_ok());
    }
}
```

### 9.2 Integration Tests

```typescript
// __tests__/integration.test.ts
test('end-to-end: register -> buy -> stake -> claim', async () => {
  // Register content
  const content = await createContent();
  
  // Deploy token + sale
  const { tokenId, saleId } = await deployOffering(content.id);
  
  // Buy tokens
  await buyTokens(saleId, 1000n);
  
  // Stake
  await stake(saleId, 1000n);
  
  // Deposit revenue
  await depositRevenue(content.id, 10000n);
  
  // Claim
  const claimable = await getClaimable(content.id);
  expect(claimable).toBe(10000n);
});
```

---

## 10) Observability

### 10.1 Events

Index all contract events:
- `ContentRegistered`
- `SalePurchased`
- `StakeChanged`
- `RevenueDeposited`
- `Claim`
- `LicenseMinted`
- `LicenseRevoked`

### 10.2 Logging

```typescript
// Backend logging
logger.info('Contract invoked', {
  contract: 'content_token',
  function: 'transfer',
  args: { from, to, amount },
  txHash,
});
```

### 10.3 Metrics

- TPS on buy/claim
- Fail rates
- Avg confirmation time
- Revenue lag vs. statement date

---

## 11) Economics Example

### Bonding Curve Calculation

```typescript
// Parameters
const A = 100_000_000_000; // 1000 USDC in 7 decimals
const S = 1000;            // 1000 tokens
const p0 = 50_000_000;     // 0.5 USDC base price in 7 decimals

// Calculate slope k
const k = (2 * (A - S * p0)) / (S * (S - 1));
// k = 0.099950002 USDC per token (7 decimals)

// Price for token n
const price = (n: number) => p0 + k * n;

// Example: 100th token
const price100 = price(100); // 0.549995 USDC
```

---

## 12) Roadmap & Platform Functionality

### Phase 1: MVP (Current) - Basic Token Economy
**Expected Functionality:**
- Creators can tokenize content and launch token sales via bonding curve
- Investors can buy content tokens with USDC and stake for revenue sharing
- Monthly revenue distribution to staked token holders
- Basic KYC simulation (hardcoded SumSub yes/no responses)
- Simple web interface for token purchase and staking

**Implementation Status:**
- ✅ ContentToken (permissioned fungible token with KYC allowlist)
- ✅ BondingCurveSale (linear pricing curve for token purchases)
- ⏳ StakingEscrow (locks tokens for revenue participation)
- ⏳ RevenueDistributor (pro-rata USDC distribution to stakers)

**Incomplete Part Handling:**
- **StakingEscrow**: Use temporary manual staking tracking in database until contract is deployed
- **RevenueDistributor**: Manual revenue distribution via backend API calls until automated on-chain distribution is ready
- **Frontend**: Basic React components with mock data for staking/claiming until contracts are live

### Phase 2: Content Registry & Licensing Core
**Expected Functionality:**
- Unique content fingerprint registration (ISRC, audio hashes)
- Parent-child content relationships (albums → tracks)
- Commercial licensing system with stake-based thresholds
- Soulbound license NFTs for businesses
- Auto-revocation when stake requirements not met

**Implementation Status:**
- ⏳ ContentRegistry (content metadata and fingerprint storage)
- ⏳ LicenseManager (enforces stake thresholds for commercial rights)
- ⏳ LicenseNFT (non-transferable proof of license ownership)

**Incomplete Part Handling:**
- **ContentRegistry**: Use centralized database for content metadata until on-chain registry is deployed
- **Licensing**: Manual license approval process via admin dashboard until automated smart contract system
- **License NFTs**: Issue temporary database records for licenses until soulbound NFTs are implemented
- **Threshold Monitoring**: Backend cron jobs to check stake levels and manually revoke licenses until auto-revocation contracts

### Phase 3: Enterprise Features & Compliance
**Expected Functionality:**
- Oracle-based revenue attestations with cryptographic proofs
- AMM liquidity pools for secondary token trading
- Regulation Crowdfunding (Reg CF) compliance portal
- Real-time revenue reporting and audit trails
- Advanced analytics dashboard

**Implementation Status:**
- ⏳ OracleAttestation (signed revenue data posting)
- ⏳ AMM seeding (DEX integration for token liquidity)
- ⏳ Reg CF portal (regulatory compliance workflows)

**Incomplete Part Handling:**
- **Revenue Attestations**: Manual revenue reporting via admin interface until oracle system
- **AMM Integration**: Basic order book on centralized exchange until Stellar DEX integration
- **Reg CF Compliance**: PDF-based documentation and manual filing until automated portal
- **Oracle System**: Trusted admin posting revenue data until decentralized oracle network

### Phase 4: Scale & Cross-Chain
**Expected Functionality:**
- Aggregated content catalogs (multiple creators in one offering)
- Cross-chain bridges for token portability
- Mobile-first wallet experience
- Advanced DeFi integrations (lending, derivatives)
- Global expansion with multi-jurisdiction support

**Implementation Status:**
- ⏳ Aggregated catalogs (bundle multiple content pieces)
- ⏳ Cross-chain read mirrors (view data on other chains)
- ⏳ Mobile wallet UX (React Native or PWA)

**Incomplete Part Handling:**
- **Catalog Aggregation**: Manual bundling via admin tools until automated catalog contracts
- **Cross-Chain**: Single-chain operation until bridge infrastructure is mature
- **Mobile Experience**: Responsive web app until native mobile development
- **DeFi Integration**: Basic staking only until advanced DeFi protocol integrations

### Fallback Strategies for Incomplete Components

**Database-First Approach:**
- All incomplete smart contract functionality initially implemented in PostgreSQL
- Event sourcing pattern to replay database actions to smart contracts when ready
- Gradual migration from centralized to decentralized components

**Admin Dashboard Overrides:**
- Manual intervention capabilities for all automated processes
- Admin can trigger distributions, approve licenses, and manage allowlists
- Audit logs for all manual actions to maintain transparency

**Progressive Decentralization:**
- Start with centralized backend APIs
- Replace with smart contract calls as contracts are deployed and tested
- Maintain hybrid approach during transition periods

**User Communication:**
- Clear labeling of "beta" features and manual processes
- Regular updates on decentralization progress
- Migration guides when moving from manual to automated systems

**Risk Mitigation:**
- Escrow mechanisms for all funds until full smart contract deployment
- Multi-signature wallets for admin functions
- Regular security audits at each phase transition
- Gradual rollout with limited user groups before full launch

---

## 13) User Flows & Journey Maps by Phase

### Phase 1: MVP User Journeys

#### 🎵 **Creator Journey - Content Tokenization**
```
1. Wallet Connection
   → Connect Freighter wallet
   → Complete hardcoded KYC (enter "yes" for approval)
   → Verify identity status

2. Content Registration
   → Upload track metadata (title, ISRC, duration)
   → Upload audio file for fingerprinting
   → Define ownership splits (if multiple creators)
   → Set content scope (single track, album rights, etc.)

3. Economics Configuration
   → Set total token supply (e.g., 1000 tokens)
   → Configure bonding curve (base price: $0.50, target: $1000)
   → Define revenue split percentages
   → Set minimum stake period

4. Token Launch
   → Review and confirm offering details
   → Deploy ContentToken contract (manual admin approval)
   → Deploy BondingCurveSale contract
   → Go live with offering

5. Post-Launch Management
   → Monitor token sales progress
   → Upload monthly revenue statements (manual)
   → Track investor staking activity
   → Communicate with token holders
```

#### 💰 **Investor Journey - Token Investment**
```
1. Platform Discovery
   → Browse available content offerings
   → Filter by genre, artist, revenue history
   → View bonding curve pricing

2. Due Diligence
   → Review content metadata and rights scope
   → Analyze revenue projections
   → Check creator track record
   → Understand token economics

3. Investment Process
   → Connect wallet and complete KYC
   → Calculate token purchase cost via bonding curve
   → Approve USDC spending
   → Execute purchase transaction
   → Receive ContentTokens in wallet

4. Staking for Revenue
   → Navigate to staking interface
   → Choose amount to stake (manual tracking)
   → Lock tokens for revenue sharing
   → Monitor staked balance

5. Revenue Claims
   → Wait for monthly distribution period
   → Check claimable revenue amount
   → Execute claim transaction (manual admin processing)
   → Receive USDC proportional to stake
```

#### 🏢 **Business Journey - Basic Token Holding** (Limited in Phase 1)
```
1. Token Acquisition
   → Same as investor flow above
   → Purchase larger amounts for future licensing

2. Portfolio Management
   → Track token holdings across content
   → Monitor for licensing opportunities
   → Prepare for Phase 2 licensing features
```

### Phase 2: Content Registry & Licensing Journeys

#### 🎵 **Enhanced Creator Journey**
```
1-4. [Same as Phase 1]

5. Advanced Content Management
   → Register content fingerprints on-chain
   → Create parent-child relationships (album → tracks)
   → Set commercial licensing terms
   → Configure stake thresholds for different license types

6. License Management
   → Review incoming license requests
   → Set pricing for commercial usage
   → Monitor business stake levels
   → Track license activations/revocations
```

#### 🏢 **Business Journey - Commercial Licensing**
```
1. Content Discovery
   → Browse licensed content catalog
   → Filter by usage rights (sync, commercial, broadcast)
   → Review licensing terms and stake requirements

2. Stake-Based Licensing
   → Purchase required minimum tokens
   → Stake tokens above threshold (e.g., 100 tokens for sync rights)
   → Maintain stake to keep license active

3. License Activation
   → Submit license request with usage details
   → Upload project information (ad campaign, film, etc.)
   → Receive soulbound License NFT
   → Download license agreement

4. Usage & Compliance
   → Use content according to license terms
   → Monitor stake levels to avoid auto-revocation
   → Report usage metrics (future phase)
   → Renew or extend licensing periods

5. License Management
   → View active licenses in dashboard
   → Receive alerts for stake threshold risks
   → Transfer or sell tokens (license auto-revokes)
   → Archive completed projects
```

#### 💰 **Enhanced Investor Journey**
```
[Same as Phase 1, plus:]

6. Secondary Market Participation
   → Trade tokens on basic order book
   → Set limit orders for entry/exit
   → Monitor liquidity and spreads

7. License Revenue Sharing
   → Earn from commercial licensing fees
   → Track business licensing activity
   → Receive additional revenue streams beyond royalties
```

### Phase 3: Enterprise & Compliance Journeys

#### 🏛️ **Enterprise Creator Journey**
```
1-6. [Same as Phase 2]

7. Oracle Integration
   → Connect to revenue reporting systems
   → Automate monthly attestations
   → Cryptographically sign revenue data
   → Reduce manual reporting overhead

8. Regulatory Compliance
   → File Reg CF documentation
   → Submit to regulatory portals
   → Maintain compliance reporting
   → Scale to institutional investors

9. Advanced Analytics
   → Real-time revenue dashboards
   → Investor behavior analytics
   → Licensing usage metrics
   → ROI optimization insights
```

#### 🏢 **Enterprise Business Journey**
```
1-5. [Same as Phase 2]

6. Bulk Licensing Operations
   → License multiple content pieces
   → Manage enterprise-level stakes
   → Automate license renewals
   → Integrate with business systems

7. Advanced Compliance
   → Automated usage reporting
   → Audit trail maintenance
   → Integration with legal systems
   → Multi-jurisdiction operations
```

#### 🏦 **Institutional Investor Journey**
```
1. Institutional Onboarding
   → Enhanced KYC/AML procedures
   → Large-scale USDC deposits
   → Compliance documentation
   → Risk assessment protocols

2. Portfolio Management
   → Diversified content investments
   → Automated rebalancing
   → Risk management tools
   → Performance analytics

3. Liquidity Management
   → AMM liquidity provision
   → Market making activities
   → Arbitrage opportunities
   → Exit strategy execution
```

### Phase 4: Advanced DeFi & Global Journeys

#### 🌍 **Global Creator Journey**
```
1-8. [Same as Phase 3]

9. Catalog Aggregation
   → Bundle multiple releases
   → Create diversified offerings
   → Cross-promote with other creators
   → Scale revenue operations

10. Cross-Chain Operations
    → Bridge tokens to other chains
    → Access broader DeFi ecosystems
    → Multi-chain revenue streams
    → Global market expansion
```

#### 📱 **Mobile-First User Journey**
```
1. Mobile Discovery
   → Native app content browsing
   → Social sharing and discovery
   → Push notifications for opportunities
   → Simplified investment flows

2. Seamless Transactions
   → One-tap token purchases
   → Biometric transaction signing
   → Background staking management
   → Instant revenue notifications

3. Social Features
   → Follow favorite creators
   → Share investment successes
   → Community voting on content
   → Social proof mechanisms
```

#### 🔗 **Advanced DeFi Journey**
```
1. Sophisticated Trading
   → Derivatives and options on content tokens
   → Yield farming with staked tokens
   → Leveraged positions
   → Portfolio hedging strategies

2. Advanced Analytics
   → AI-powered investment recommendations
   → Predictive revenue modeling
   → Risk assessment tools
   → Market sentiment analysis
```

### User Experience Principles Across All Phases

**Consistency:**
- Unified wallet connection flow
- Consistent terminology and UI patterns
- Progressive disclosure of complexity
- Seamless phase transitions

**Safety & Trust:**
- Clear indication of manual vs automated processes
- Transparent fee structures
- Risk warnings and educational content
- Regular security updates

**Accessibility:**
- Mobile-responsive design from Phase 1
- Multiple language support (Phase 3+)
- Accessibility compliance (WCAG)
- Progressive web app capabilities

**Community:**
- Creator-investor communication channels
- Community governance participation
- Social proof and testimonials
- Educational content and tutorials

---

## 14) UI Design System & File Naming Conventions

### 14.1 Design System Principles

#### **Visual Hierarchy & Simplicity**
```
Primary Navigation: 3 main sections maximum per user type
- Creators: Create | Manage | Analytics
- Investors: Discover | Portfolio | Earnings  
- Businesses: Browse | Licenses | Compliance

Secondary Actions: Always contextual to current view
Tertiary Actions: Hidden in overflow menus
```

#### **Color Palette & Branding**
```css
/* Primary Colors */
--primary-stellar: #7B61FF      /* Stellar purple - CTAs, active states */
--primary-content: #1A1A1A      /* Content text, icons */
--primary-success: #10B981      /* Success states, revenue positive */
--primary-warning: #F59E0B      /* Warnings, pending states */
--primary-error: #EF4444        /* Errors, failed transactions */

/* Neutral Palette */
--neutral-50: #F9FAFB          /* Background, cards */
--neutral-100: #F3F4F6         /* Dividers, borders */
--neutral-500: #6B7280         /* Secondary text */
--neutral-900: #111827         /* Primary text */

/* Semantic Colors */
--revenue-green: #059669       /* Revenue indicators */
--stake-blue: #3B82F6          /* Staking related */
--license-orange: #EA580C      /* Commercial licensing */
```

#### **Typography Scale**
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
--text-xs: 0.75rem     /* 12px - Labels, badges */
--text-sm: 0.875rem    /* 14px - Secondary text */
--text-base: 1rem      /* 16px - Body text */
--text-lg: 1.125rem    /* 18px - Subheadings */
--text-xl: 1.25rem     /* 20px - Page titles */
--text-2xl: 1.5rem     /* 24px - Section headers */
--text-3xl: 1.875rem   /* 30px - Hero text */
```

### 14.2 Component Architecture & File Naming

#### **Frontend Structure**
```
src/
├── components/                 # Reusable UI components
│   ├── ui/                    # Base design system components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Input/
│   │   └── index.ts           # Barrel exports
│   ├── layout/                # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── PageLayout/
│   ├── features/              # Feature-specific components
│   │   ├── wallet/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── WalletStatus.tsx
│   │   │   └── index.ts
│   │   ├── content/
│   │   │   ├── ContentCard.tsx
│   │   │   ├── ContentUpload.tsx
│   │   │   ├── ContentWizard.tsx
│   │   │   └── index.ts
│   │   ├── tokens/
│   │   │   ├── TokenPurchase.tsx
│   │   │   ├── TokenStaking.tsx
│   │   │   ├── BondingCurve.tsx
│   │   │   └── index.ts
│   │   ├── licensing/
│   │   │   ├── LicenseRequest.tsx
│   │   │   ├── LicenseNFT.tsx
│   │   │   ├── StakeThreshold.tsx
│   │   │   └── index.ts
│   │   └── revenue/
│   │       ├── RevenueChart.tsx
│   │       ├── ClaimInterface.tsx
│   │       └── index.ts
│   └── common/                # Shared utility components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── NotificationToast.tsx
│       └── index.ts
├── pages/                     # Route components
│   ├── HomePage.tsx
│   ├── creator/
│   │   ├── CreatorDashboard.tsx
│   │   ├── CreateContent.tsx
│   │   ├── ManageContent.tsx
│   │   └── CreatorAnalytics.tsx
│   ├── investor/
│   │   ├── InvestorDashboard.tsx
│   │   ├── DiscoverContent.tsx
│   │   ├── Portfolio.tsx
│   │   └── Earnings.tsx
│   ├── business/
│   │   ├── BusinessDashboard.tsx
│   │   ├── BrowseLicenses.tsx
│   │   ├── ActiveLicenses.tsx
│   │   └── Compliance.tsx
│   └── auth/
│       ├── Login.tsx
│       ├── KYCFlow.tsx
│       └── Onboarding.tsx
├── hooks/                     # Custom React hooks
│   ├── useWallet.ts
│   ├── useContract.ts
│   ├── useStaking.ts
│   └── useRevenue.ts
├── services/                  # API and contract interactions
│   ├── api/
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── tokens.ts
│   │   └── licensing.ts
│   ├── contracts/
│   │   ├── contentToken.ts
│   │   ├── bondingCurve.ts
│   │   ├── stakingEscrow.ts
│   │   └── licenseManager.ts
│   └── utils/
│       ├── formatting.ts
│       ├── validation.ts
│       └── constants.ts
├── types/                     # TypeScript type definitions
│   ├── user.ts
│   ├── content.ts
│   ├── tokens.ts
│   └── contracts.ts
└── styles/                    # Global styles and themes
    ├── globals.css
    ├── components.css
    └── themes/
        ├── light.css
        └── dark.css
```

### 14.3 UI Component Standards

#### **Button System**
```typescript
// Button.tsx - Unified button component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

// Usage examples
<Button variant="primary" size="lg">Connect Wallet</Button>
<Button variant="secondary" icon={<StakeIcon />}>Stake Tokens</Button>
<Button variant="danger" loading={isProcessing}>Claim Revenue</Button>
```

#### **Card System**
```typescript
// Unified content cards across all user types
interface ContentCardProps {
  content: ContentMeta;
  userType: 'creator' | 'investor' | 'business';
  actions: 'view' | 'invest' | 'license' | 'manage';
}

// Consistent card layout
<ContentCard 
  content={contentData}
  userType="investor"
  actions="invest"
/>
```

#### **Modal System**
```typescript
// Consistent modal patterns for all flows
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

// Usage for all transaction flows
<Modal title="Purchase Tokens" size="md">
  <TokenPurchaseFlow />
</Modal>
```

### 14.4 User Journey Simplification

#### **One-Click Actions**
```typescript
// Simplified interaction patterns
const quickActions = {
  // Investor: One-click token purchase
  buyTokens: (contentId: string, amount: number) => {
    // Pre-calculate costs, show confirmation modal
  },
  
  // Creator: One-click content upload
  uploadContent: (files: FileList) => {
    // Auto-extract metadata, show progress wizard
  },
  
  // Business: One-click license activation
  activateLicense: (contentId: string) => {
    // Check stake, activate if sufficient
  }
};
```

#### **Progress Indicators**
```typescript
// Consistent progress tracking across all flows
interface ProgressStepProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

// Usage in all multi-step processes
<ProgressSteps 
  steps={['Upload', 'Configure', 'Deploy', 'Launch']}
  currentStep={2}
  completedSteps={[0, 1]}
/>
```

#### **Smart Defaults & Auto-completion**
```typescript
// Reduce user input with intelligent defaults
const smartDefaults = {
  // Auto-fill from uploaded audio file
  contentMetadata: {
    duration: extractFromAudio(),
    genre: detectGenre(),
    suggestedPrice: calculateOptimalPrice()
  },
  
  // Auto-calculate optimal investment amounts
  investmentSuggestions: {
    conservative: calculateStakeAmount(0.1), // 10% of portfolio
    moderate: calculateStakeAmount(0.2),     // 20% of portfolio
    aggressive: calculateStakeAmount(0.3)    // 30% of portfolio
  }
};
```

### 14.5 Navigation Patterns

#### **Role-Based Navigation**
```typescript
// Simplified navigation per user type
const navigationConfig = {
  creator: [
    { label: 'Create', path: '/creator/create', icon: 'plus' },
    { label: 'Manage', path: '/creator/manage', icon: 'settings' },
    { label: 'Analytics', path: '/creator/analytics', icon: 'chart' }
  ],
  investor: [
    { label: 'Discover', path: '/investor/discover', icon: 'search' },
    { label: 'Portfolio', path: '/investor/portfolio', icon: 'briefcase' },
    { label: 'Earnings', path: '/investor/earnings', icon: 'dollar' }
  ],
  business: [
    { label: 'Browse', path: '/business/browse', icon: 'grid' },
    { label: 'Licenses', path: '/business/licenses', icon: 'document' },
    { label: 'Compliance', path: '/business/compliance', icon: 'shield' }
  ]
};
```

#### **Breadcrumb System**
```typescript
// Consistent breadcrumb navigation
interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
    current?: boolean;
  }>;
}

// Usage
<Breadcrumb items={[
  { label: 'Dashboard', path: '/creator' },
  { label: 'Content Management', path: '/creator/manage' },
  { label: 'Edit Track', current: true }
]} />
```

### 14.6 Responsive Design Standards

#### **Breakpoint System**
```css
/* Mobile-first responsive design */
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
}

/* Component responsive patterns */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;                    /* Mobile: 1 column */
  gap: 1rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);       /* Tablet: 2 columns */
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);       /* Desktop: 3 columns */
    gap: 2rem;
  }
}
```

### 14.7 Error Handling & Loading States

#### **Consistent Error Messages**
```typescript
// Unified error handling patterns
const errorMessages = {
  wallet: {
    notConnected: 'Please connect your wallet to continue',
    insufficientFunds: 'Insufficient USDC balance for this transaction',
    transactionFailed: 'Transaction failed. Please try again.'
  },
  kyc: {
    notVerified: 'Complete KYC verification to access this feature',
    pending: 'KYC verification in progress',
    rejected: 'KYC verification failed. Please contact support.'
  },
  staking: {
    insufficientTokens: 'Insufficient tokens to meet staking requirement',
    alreadyStaked: 'You have already staked the maximum amount'
  }
};
```

#### **Loading State Patterns**
```typescript
// Consistent loading indicators
const LoadingStates = {
  skeleton: <SkeletonCard />,           // Initial page load
  spinner: <LoadingSpinner />,          // Button actions
  progress: <ProgressBar />,            // File uploads
  pulse: <PulseIndicator />             // Real-time updates
};
```

### 14.8 Accessibility Standards

#### **Keyboard Navigation**
```typescript
// Ensure all interactions are keyboard accessible
const keyboardHandlers = {
  onKeyDown: (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleAction();
    }
    if (event.key === 'Escape') {
      closeModal();
    }
  }
};
```

#### **Screen Reader Support**
```typescript
// ARIA labels and semantic HTML
<button 
  aria-label="Purchase 100 tokens for $55.00 USDC"
  aria-describedby="token-purchase-help"
>
  Buy Tokens
</button>
<div id="token-purchase-help" className="sr-only">
  This will purchase tokens using the current bonding curve price
</div>
```

---

## 15) Resources

- [Scaffold Stellar Docs](https://scaffoldstellar.com)
- [Stellar CLI Docs](https://github.com/stellar/stellar-cli)
- [Soroban SDK](https://soroban.stellar.org/docs)
- [Stellar Futurenet](https://www.stellar.org/developers/futurenet)
- [Freighter Wallet](https://freighter.app)

---

## 16) Getting Help

- [Discord](https://discord.gg/stellar)
- [Stack Exchange](https://stellar.stackexchange.com)
- [GitHub Issues](https://github.com/stellar/stellar-cli/issues)

Happy building! 🚀
