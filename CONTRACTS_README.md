# BaseGuardian Smart Contracts

This directory contains the smart contracts for the BaseGuardian decentralized cross-chain security agent platform. Each feature has its own dedicated contract that implements the BaseChain Universal Smart Contract interface.

## 📋 Contract Overview

### 1. **ContractAnalysis.sol**
- **Purpose**: Smart contract risk analysis service
- **Function**: `requestContractAnalysis(string contractAddress)`
- **Payment**: 0.001 aBase minimum
- **Features**: 
  - Honeypot detection
  - Owner privileges analysis
  - Rugpull analysis
  - Liquidity checks

### 2. **Tokenomics.sol**
- **Purpose**: Cross-chain tokenomics evaluation
- **Function**: `requestTokenomicsAnalysis(string tokenAddress)`
- **Payment**: 0.001 aBase minimum
- **Features**:
  - Whale concentration analysis
  - Tax structure evaluation
  - Holder distribution analysis
  - Liquidity lock verification

### 3. **SocialAnalysis.sol**
- **Purpose**: Social & community forensics
- **Function**: `requestSocialAnalysis(string projectName)`
- **Payment**: 0.001 aBase minimum
- **Features**:
  - Twitter/X sentiment analysis
  - Telegram group analysis
  - Discord community evaluation
  - Google search sentiment

### 4. **Monitoring.sol**
- **Purpose**: Real-time protection & alerts
- **Function**: `requestMonitoring(string targetAddress)`
- **Payment**: 0.001 aBase minimum
- **Features**:
  - Price monitoring
  - Whale tracking
  - Threat detection
  - Instant alerts

## 🔧 Contract Architecture

All contracts follow the BaseChain Universal Smart Contract pattern:

```solidity
contract FeatureName is UniversalContract {
    GatewayZEVM public immutable GATEWAY;
    uint256 public constant MINIMUM_PAYMENT = 0.001 ether;
    
    // Events for tracking
    event FeatureRequested(address indexed user, string target, uint256 payment);
    event FeatureCompleted(address indexed user, string target, uint256 riskScore, string analysis);
    
    // Core functions
    function requestFeature(string memory target) external payable;
    function completeAnalysis(address user, uint256 requestIndex, uint256 riskScore, string memory analysis) external onlyOwner;
}
```

## 🚀 Deployment

### Prerequisites
1. Node.js and npm/yarn installed
2. Hardhat configured
3. Private key with aBase balance on BaseChain Athens 3
4. Environment variables set up

### Environment Setup
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
```

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy to BaseChain Athens 3
```bash
npx hardhat run scripts/deploy-features.ts --network BasechainAthens
```

### Manual Deployment (Individual Contracts)
```bash
# Contract Analysis
npx hardhat run scripts/deploy-features.ts --network BasechainAthens

# Or deploy individually
npx hardhat run --network BasechainAthens -e "
const ContractAnalysis = await ethers.getContractFactory('ContractAnalysis');
const contract = await ContractAnalysis.deploy('0x6c533f7fe93fae114d0954697069df33c9b74fd7');
await contract.waitForDeployment();
console.log('Deployed to:', await contract.getAddress());
"
```

## 🌐 Network Configuration

### BaseChain Athens 3 (Testnet)
- **RPC URL**: `https://Basechain-athens-evm.blockpi.network/v1/rpc/public`
- **Chain ID**: `7001`
- **Currency**: `aBase`
- **Explorer**: `https://athens3.Basescan.io`
- **Gateway**: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`

## 💰 Payment System

### Minimum Payment
- **Amount**: 0.001 aBase per feature
- **Purpose**: Access control and spam prevention
- **Permanence**: One-time payment per user per feature

### Payment Flow
1. User connects wallet
2. User calls feature function with payment
3. Contract verifies payment amount
4. User is marked as paid
5. Feature becomes accessible
6. Analysis request is created

## 📊 Contract Functions

### Common Functions (All Contracts)
```solidity
// Request analysis with payment
function requestFeature(string memory target) external payable;

// Complete analysis (owner only)
function completeAnalysis(address user, uint256 requestIndex, uint256 riskScore, string memory analysis) external onlyOwner;

// Check payment status
function checkPaymentStatus(address user) external view returns (bool);

// Get user requests
function getUserRequests(address user) external view returns (FeatureRequest[] memory);

// Withdraw payments (owner only)
function withdrawPayments() external onlyOwner;

// Transfer ownership
function transferOwnership(address newOwner) external onlyOwner;
```

### Monitoring-Specific Functions
```solidity
// Trigger alert
function triggerAlert(address user, uint256 requestIndex, string memory alertType, string memory message) external onlyOwner;

// Stop monitoring
function stopMonitoring(uint256 requestIndex) external;
```

## 🔍 Events

All contracts emit events for tracking and frontend integration:

```solidity
event FeatureRequested(address indexed user, string target, uint256 payment);
event FeatureCompleted(address indexed user, string target, uint256 riskScore, string analysis);
event PaymentReceived(address indexed user, uint256 amount);
event AlertTriggered(address indexed user, string target, string alertType, string message); // Monitoring only
```

## 🛡️ Security Features

### Access Control
- `onlyOwner` modifier for admin functions
- `onlyGateway` modifier for cross-chain calls
- `hasValidPayment` modifier for feature access

### Payment Validation
- Minimum payment requirement
- Payment status tracking
- Secure withdrawal mechanism

### Data Integrity
- Request indexing and validation
- Timestamp tracking
- Completion status verification

## 🔗 Integration with Frontend

### Contract Interaction Flow
1. **Wallet Connection**: User connects wallet to frontend
2. **Payment Verification**: Frontend checks `checkPaymentStatus(user)`
3. **Feature Request**: If not paid, user calls `requestFeature()` with payment
4. **Analysis Request**: Frontend creates analysis request with contract data
5. **Backend Processing**: Backend processes analysis and calls `completeAnalysis()`
6. **Result Display**: Frontend displays results from contract events

### Frontend Integration Points
```javascript
// Check if user has paid
const hasPaid = await contract.checkPaymentStatus(userAddress);

// Request analysis with payment
const tx = await contract.requestFeature(targetAddress, { value: ethers.parseEther("0.001") });

// Get user's analysis history
const requests = await contract.getUserRequests(userAddress);

// Listen for completion events
contract.on("FeatureCompleted", (user, target, riskScore, analysis) => {
  // Update UI with results
});
```

## 🧪 Testing

### Test Commands
```bash
# Run all tests
npx hardhat test

# Test specific contract
npx hardhat test test/ContractAnalysis.test.ts

# Test with coverage
npx hardhat coverage
```

### Test Structure
- Unit tests for each contract function
- Integration tests for payment flow
- Event emission verification
- Access control validation

## 📈 Gas Optimization

### Optimizations Applied
- Solidity optimizer enabled (200 runs)
- Efficient data structures
- Minimal storage operations
- Event-based state tracking

### Gas Estimates
- **Deployment**: ~2,000,000 gas per contract
- **Feature Request**: ~150,000 gas
- **Analysis Completion**: ~100,000 gas
- **Payment Check**: ~25,000 gas (view function)

## 🔄 Cross-Chain Integration

### BaseChain Gateway Integration
All contracts implement the `UniversalContract` interface for cross-chain functionality:

```solidity
function onCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external override onlyGateway;
```

### Cross-Chain Features
- Cross-chain data fetching
- Multi-chain analysis
- Cross-chain alerting
- Universal liquidity monitoring

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For technical support or questions about the smart contracts:
- Create an issue on GitHub
- Check the BaseChain documentation
- Review the contract comments and events
