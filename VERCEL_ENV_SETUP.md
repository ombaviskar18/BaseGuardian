# Vercel Environment Variables Setup Guide

## Required Environment Variables for BaseGuardian Backend API

To make the backend API work properly on Vercel, you need to set the following environment variables in your Vercel project dashboard.

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your `Base-gaurdian` project
4. Go to **Settings** → **Environment Variables**

### 2. Add the following Environment Variables:

#### **Ethereum Configuration**
```
ETHERSCAN_API_KEY=your_etherscan_api_key_here
ALCHEMY_ETH_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
INFURA_ETH_SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
ALCHEMY_ETH_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_key
INFURA_ETH_MAINNET_URL=https://mainnet.infura.io/v3/your_infura_key
```

#### **Base Configuration**
```
BASESCAN_API_KEY=your_basescan_api_key_here
ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/your_alchemy_key
```

#### **Polygon Configuration**
```
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
POLYGON_AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/your_infura_key
```

#### **BSC Configuration**
```
BSCSCAN_API_KEY=your_bscscan_api_key_here
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

#### **Avalanche Configuration**
```
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

#### **AI Configuration**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. How to Get API Keys

#### **Etherscan API Key**
1. Visit [etherscan.io](https://etherscan.io)
2. Create an account
3. Go to **API-KEYs** section
4. Create a new API key

#### **Alchemy API Key**
1. Visit [alchemy.com](https://alchemy.com)
2. Create an account
3. Create a new app
4. Copy the HTTP URL

#### **Infura API Key**
1. Visit [infura.io](https://infura.io)
2. Create an account
3. Create a new project
4. Copy the project ID and use in URL format

#### **BaseScan API Key**
1. Visit [basescan.org](https://basescan.org)
2. Create an account
3. Go to **API-KEYs** section
4. Create a new API key

#### **PolygonScan API Key**
1. Visit [polygonscan.com](https://polygonscan.com)
2. Create an account
3. Go to **API-KEYs** section
4. Create a new API key

#### **BSCScan API Key**
1. Visit [bscscan.com](https://bscscan.com)
2. Create an account
3. Go to **API-KEYs** section
4. Create a new API key

#### **Snowtrace API Key**
1. Visit [snowtrace.io](https://snowtrace.io)
2. Create an account
3. Go to **API-KEYs** section
4. Create a new API key

#### **Gemini API Key**
1. Visit [ai.google.dev](https://ai.google.dev)
2. Create an account
3. Go to **API Keys** section
4. Create a new API key

### 4. Environment Variable Priority

The API will use the first available configuration in this order:
- **Ethereum**: `ALCHEMY_ETH_SEPOLIA_URL` → `INFURA_ETH_SEPOLIA_URL`
- **Mainnet**: `ALCHEMY_ETH_MAINNET_URL` → `INFURA_ETH_MAINNET_URL`

### 5. Testing the Setup

After setting up the environment variables:

1. **Redeploy your project** in Vercel
2. **Test the health endpoint**: `https://Base-gaurdian.vercel.app/api/health`
3. **Test contract analysis**: `https://Base-gaurdian.vercel.app/api/inspect?chain=ethereum&address=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

### 6. Troubleshooting

If you get errors like:
- `"RPC URL not configured"` → Add the missing RPC URL environment variable
- `"API key not configured"` → Add the missing API key environment variable
- `"No contract bytecode found"` → The address might not be a contract or RPC is not working

### 7. Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage to avoid rate limits

### 8. Optional: Free Tier Alternatives

For testing, you can use these free alternatives:
- **Infura**: Free tier with 100,000 requests/day
- **Alchemy**: Free tier with 300M compute units/month
- **Public RPCs**: Some chains have public RPC endpoints (not recommended for production)

---

**After setting up these environment variables, your BaseGuardian backend API will be fully functional!** 🚀
