# Base Guardian - Base Sepolia Deployment Guide

## Overview
This guide will help you deploy the Base Guardian contracts to Base Sepolia testnet.

## Prerequisites
1. Node.js and npm/yarn installed
2. A wallet with Base Sepolia ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
3. Private key for deployment

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Base Sepolia Deployment Configuration
# Add your private key here (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

## Network Configuration
- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency**: ETH
- **Explorer**: https://sepolia.basescan.org

## Installation

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

## Deployment

Deploy all contracts to Base Sepolia:
```bash
npm run deploy:base
```

This will deploy:
- BaseContractAnalysis
- BaseMonitoring  
- BaseSocialAnalysis
- BaseTokenomics

## Contract Verification

After deployment, verify contracts on BaseScan:
```bash
# Replace with actual contract addresses from deployment
npx hardhat verify --network baseSepolia 0x... # BaseContractAnalysis
npx hardhat verify --network baseSepolia 0x... # BaseMonitoring
npx hardhat verify --network baseSepolia 0x... # BaseSocialAnalysis
npx hardhat verify --network baseSepolia 0x... # BaseTokenomics
```

## Contract Features

### Payment System
- Each feature requires 0.01 ETH payment
- Payments are collected in the contract
- Owner can withdraw accumulated payments

### BaseContractAnalysis
- Request contract analysis with payment
- Owner can complete analysis with risk score and report
- View user's analysis history

### BaseMonitoring
- Request monitoring service with payment
- Owner can complete monitoring analysis
- Trigger alerts for monitored addresses
- Stop monitoring for specific requests

### BaseSocialAnalysis
- Request social analysis with payment
- Owner can complete social analysis
- View user's social analysis history

### BaseTokenomics
- Request tokenomics analysis with payment
- Owner can complete tokenomics analysis
- View user's tokenomics analysis history

## Contract Addresses

After deployment, contract addresses will be saved to `base-contract-addresses.json`.

## Testing

Test contracts locally:
```bash
npx hardhat test
```

## Frontend Integration

Update your frontend configuration to use the new Base Sepolia contract addresses and network settings.

## Support

For issues or questions, please refer to the Base documentation or create an issue in the repository.
