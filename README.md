# SkyStake | Fixed-Period Token Staking Protocol

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.35-red)
![Angular](https://img.shields.io/badge/Angular-18.2-red)

## 🌟 Project Overview

**SkyStake** is a decentralized staking protocol that enables users to deposit ERC-20 tokens and earn fixed rewards after completing a predetermined staking period. Built on the Ethereum blockchain with a modern Angular frontend, SkyStake provides a secure, intuitive, and transparent way to participate in token staking.

### What It Does

SkyStake simplifies cryptocurrency staking by offering a **fixed-amount, fixed-period** staking mechanism. Users lock a specific amount of tokens for a defined duration and receive guaranteed ETH rewards upon completion. No complex calculations. No variable APYs. Just straightforward, predictable yields.

### Key Benefits

✅ **Predictable Rewards** — Know exactly how much you'll earn before you stake  
✅ **Simple & Transparent** — No hidden fees or complex mechanisms  
✅ **Non-Custodial** — Your tokens are secured by smart contracts, not intermediaries  
✅ **User-Friendly Interface** — Modern Angular dashboard with real-time status updates  
✅ **Ethereum-Native** — Runs on Ethereum Sepolia testnet with full MetaMask integration  
✅ **Auditable** — Open-source contracts built with OpenZeppelin standards  

---

## 🏗️ Architecture Overview

SkyStake is built as a monorepo containing two primary packages:

### Packages Structure

```
staking-project/
├── packages/
│   ├── contracts/          # Smart contracts (Solidity + Foundry)
│   │   ├── src/
│   │   │   ├── Stakingdapp.sol      # Main staking contract
│   │   │   └── Stakingtoken.sol     # ERC-20 token contract
│   │   ├── test/                    # Foundry test suites
│   │   ├── script/                  # Deployment scripts
│   │   └── foundry.toml             # Foundry configuration
│   │
│   └── frontend/            # Angular Web3 DApp
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/      # UI components (Hero, Navbar, Dashboard)
│       │   │   ├── services/        # Blockchain services (Wallet, Staking)
│       │   │   └── app.module.ts    # Angular module configuration
│       │   └── main.ts
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
└── README.md
```

### Technology Stack

**Smart Contracts:**
- Solidity ^0.8.35
- OpenZeppelin Contracts v5
- Foundry (Forge, Anvil, Cast)

**Frontend:**
- Angular 18.2
- ethers.js v6.16
- TypeScript 5.5
- SCSS Styling

**Blockchain:**
- Ethereum Sepolia Testnet
- MetaMask Integration
- ERC-20 Token Standard

---

## 🔄 How It Works

### User Journey

1. **Connect Wallet** — User connects their MetaMask wallet to the dApp
2. **Mint Tokens** — User mints the required ERC-20 tokens from the token contract
3. **Approve Spending** — User approves the Staking contract to spend their tokens
4. **Deposit (Stake)** — User deposits the fixed staking amount and locks tokens
5. **Wait for Period** — Tokens remain locked for the configured staking period
6. **Claim Rewards** — After the period ends, user claims their ETH rewards
7. **Withdraw** — User withdraws their original staked tokens

### Smart Contract Flow

```
User Wallet
    ↓
[MetaMask Connection]
    ↓
StakingToken Contract
├── mint()  → Create ERC-20 tokens
└── approve()  → Grant spending approval
    ↓
Staking Contract
├── depositTokens()  → Lock tokens & record timestamp
│   └── Returns: staked balance, staking start time
├── claimReward()  → Receive ETH after staking period
│   └── Requires: stakingPeriod elapsed
└── withdrawTokens()  → Unlock original tokens
```

### State Management

The Staking contract maintains three key mappings:

- **userBalances** — Tracks how many tokens each user has staked
- **userStakingTimestamps** — Records when each user began staking
- **Parameters** — Stores stakingPeriod, fixedStakingAmount, rewardPerPeriod

### Example Timeline

```
Time: 0h
└─ User deposits 100 SKY tokens
   └─ Block timestamp recorded: 1717000000

Time: 24h (Staking Period = 86,400 seconds)
└─ Dashboard shows: "1 day remaining"
└─ Progress bar: 100%

Time: 24h + 1 second
└─ claimReward() becomes available
└─ User receives: 0.01 ETH
└─ Staking timestamp resets for next cycle
```

---

## 📋 Smart Contract Details

### Staking Contract (`Stakingdapp.sol`)

**Address (Sepolia):** `0x...` *(Configure in `staking.service.ts`)*

**Key Functions:**

```solidity
// Deposit tokens to start staking
function depositTokens(uint256 tokenAmountToDeposit_) external

// Claim accumulated rewards after staking period
function claimReward() external

// Withdraw staked tokens (no time lock after initial deposit)
function withdrawTokens() external

// Admin: Update the staking period (seconds)
function setStakingPeriod(uint256 newStakingPeriod_) external onlyOwner

// Receive ETH for reward pool (owner only)
receive() external payable onlyOwner
```

**Events:**

```solidity
event DepositTokens(address userAddress, uint256 depositAmount_)
event WithdrawTokens(address userAddress, uint256 withdrawAmount_)
event SetStakingPeriod(uint256 newStakingPeriod_)
event etherSent(uint256 amount_)
```

**State Variables:**

```solidity
address public stakingToken              // ERC-20 token address
uint256 public stakingPeriod            // Duration in seconds (e.g., 86400 = 1 day)
uint256 public fixedStakingAmount       // Amount users must stake (with decimals)
uint256 public rewardPerPeriod          // ETH reward per completed period
mapping(address => uint256) userBalances           // User staked balances
mapping(address => uint256) userStakingTimestamps // Staking start times
```

### Token Contract (`Stakingtoken.sol`)

Simple ERC-20 implementation with public mint capability for testing.

**Address (Sepolia):** `0x...` *(Configure in `staking.service.ts`)*

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ & npm
- **Git**
- **MetaMask** browser extension
- **Foundry** (for smart contract development)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/staking-dapp.git
cd staking-dapp
```

#### 2. Smart Contracts Setup

```bash
cd packages/contracts

# Install dependencies
npm install

# Build contracts
forge build

# Run tests
forge test

# View gas snapshots
forge snapshot
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Update contract addresses
# Edit: src/app/services/staking.service.ts
# Set STAKING_ADDR and TOKEN_ADDR to your deployed contracts

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

---

## 🧪 Testing Smart Contracts

Run the complete test suite with Foundry:

```bash
cd packages/contracts

# Run all tests with verbose output
forge test -vv

# Run specific test file
forge test --match-path "test/Stakingdapp.t.sol" -vv

# Test with coverage
forge coverage
```

### Test Coverage

The test suite validates:
- ✅ Token deposit mechanisms
- ✅ Reward calculation logic
- ✅ Time-lock enforcement
- ✅ Access control (onlyOwner)
- ✅ Token transfer safety
- ✅ Edge cases and reverts

---

## 📡 Deployment

### Deploy to Sepolia Testnet

#### 1. Set Environment Variables

```bash
cd packages/contracts

# Create .env file
touch .env

# Add your variables
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY" >> .env
echo "PRIVATE_KEY=your_wallet_private_key" >> .env
```

#### 2. Deploy Contracts

```bash
# Deploy StakingToken
forge script script/DeployStakingToken.s.sol:DeployStakingToken \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Deploy Staking contract (use token address from above)
forge script script/DeployStaking.s.sol:DeployStaking \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

#### 3. Update Frontend

Copy the deployed contract addresses and update `packages/frontend/src/app/services/staking.service.ts`:

```typescript
const STAKING_ADDR = '0x...' // Your deployed Staking contract
const TOKEN_ADDR   = '0x...' // Your deployed Token contract
```

#### 4. Deploy Frontend

```bash
cd packages/frontend

# Build for production
npm run build

# Deploy to Vercel, Netlify, or your hosting provider
vercel deploy
```

---

## 🔐 Security Considerations

### Smart Contract Security

- **OpenZeppelin Audited Code** — Uses battle-tested OpenZeppelin contracts
- **Access Control** — Owner-only functions protected with `onlyOwner` modifier
- **Reentrancy Safe** — Uses Checks-Effects-Interactions pattern
- **Fixed Amount Mechanism** — Prevents common staking vulnerabilities

### Best Practices Implemented

✅ NatSpec comments for all functions  
✅ Clear error messages in require statements  
✅ Safe ERC-20 transfer patterns  
✅ Timestamp-based time-lock mechanism  
✅ Separate token and staking contracts  

### Audit Recommendations

For production deployment, we recommend:
1. Third-party smart contract audit
2. Formal verification of critical paths
3. Bug bounty program
4. Testnet staging with real users

---

## 📊 Frontend Features

### Dashboard Components

**Navbar** — Wallet connection status, network indicator  
**Hero Section** — Project overview and key statistics  
**Staking Dashboard** — User staking data, claim interface  

### Real-Time Data

- Staked balance display
- Time remaining until reward claim
- Progress bar showing staking period completion
- Wallet token balance
- Transaction status updates

### Web3 Integration

- **MetaMask Connection** — One-click wallet integration
- **ethers.js** — Type-safe blockchain interactions
- **Reactive State** — Angular signals for real-time updates
- **Error Handling** — User-friendly error messages

---

## 🛠️ Development

### Project Structure

```
packages/
├── contracts/
│   ├── src/                    # Smart contract source code
│   ├── test/                   # Foundry test files
│   ├── script/                 # Deployment scripts
│   ├── foundry.toml            # Foundry configuration
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/     # Reusable UI components
    │   │   ├── services/       # Angular services (Wallet, Staking)
    │   │   ├── app.module.ts   # Root module
    │   │   └── app-routing.module.ts
    │   ├── assets/             # Images, fonts, styles
    │   └── main.ts
    ├── angular.json            # Angular CLI config
    ├── tsconfig.json           # TypeScript config
    ├── package.json
    └── .gitignore
```

### Code Style Guidelines

**Solidity:**
- Follow Solidity style guide: https://docs.soliditylang.org/en/latest/style-guide.html
- Use `forge fmt` before committing
- NatSpec comments for public functions

**TypeScript/Angular:**
- Use ES6+ syntax
- Type all function parameters and returns
- Follow Angular style guide: https://angular.io/guide/styleguide
- Use meaningful variable names

### Commands

```bash
# Smart Contracts
cd packages/contracts
forge build                    # Compile contracts
forge test                     # Run tests
forge fmt                      # Format code
forge snapshot                 # Gas snapshots

# Frontend
cd packages/frontend
npm start                      # Dev server (port 4200)
npm run build                  # Production build
npm run watch                  # Watch mode
npm test                       # Run tests
```

---

## 📝 Configuration

### Smart Contract Parameters

Edit in deployment script or during construction:

```solidity
constructor(
  address stakingToken_,           // ERC-20 token address
  uint256 stakingPeriod_,          // Seconds (e.g., 86400 for 1 day)
  uint256 fixedStakingAmount_,     // Amount with decimals (e.g., 100 * 10^18)
  uint256 rewardPerPeriod_,        // ETH reward (e.g., 0.01 * 10^18)
  address owner_                   // Contract owner
)
```

### Frontend Configuration

**File:** `packages/frontend/src/app/services/staking.service.ts`

```typescript
// Update these addresses after deployment
const STAKING_ADDR = '0x...'   // Your Staking contract
const TOKEN_ADDR   = '0x...'   // Your StakingToken contract
```

**Network:** Currently configured for Ethereum Sepolia Testnet

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Write tests for new features
- Update documentation
- Follow code style guidelines
- Ensure all tests pass before submitting PR

---

## 📚 Documentation

- **[Smart Contract ABI](./packages/contracts/out/Stakingdapp.json)** — Contract interface specifications
- **[Foundry Docs](https://book.getfoundry.sh/)** — Smart contract development guide
- **[Angular Docs](https://angular.io/docs)** — Frontend framework documentation
- **[ethers.js Docs](https://docs.ethers.org/)** — Web3 library reference

---

## 🐛 Troubleshooting

### "Contract address not configured"

**Solution:** Ensure `STAKING_ADDR` and `TOKEN_ADDR` are set in `staking.service.ts`

### "MetaMask not connected"

**Solution:** 
1. Check if MetaMask is installed
2. Verify you're on Sepolia testnet
3. Click "Connect Wallet" button

### "Transaction failed - Insufficient allowance"

**Solution:** Click "Approve" button to grant spending permission to the Staking contract

### "Staking period not yet completed"

**Solution:** Wait for the configured staking period to elapse before claiming rewards

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👥 Team & Contact

- **Repository:** [github.com/yourusername/staking-dapp](https://github.com/yourusername/staking-dapp)
- **Issues:** [GitHub Issues](https://github.com/yourusername/staking-dapp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/staking-dapp/discussions)

---

## 🎯 Roadmap

**v1.0** ✅ Fixed-period staking with fixed rewards  
**v2.0** 🔄 Variable staking periods & APY tiers  
**v3.0** 🔄 Staking pool aggregation  
**v4.0** 🔄 Governance token integration  

---

## 📞 Support

For questions or issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [Issues](https://github.com/yourusername/staking-dapp/issues)
3. Open a new [Discussion](https://github.com/yourusername/staking-dapp/discussions)
4. Review [Technical Documentation](#-smart-contract-details)

---

**Built with ❤️ by the SkyStake team**

*Last Updated: June 2026*  
*Version: 1.0.0*
