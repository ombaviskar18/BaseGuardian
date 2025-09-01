# BaseChain Universal App Tutorial - Complete Guide

## 🚀 Quick Start Tutorial

This tutorial will guide you through creating and testing a Universal App on BaseChain.

### Prerequisites Completed ✅
- ✅ Node.js installed
- ✅ Yarn installed  
- ✅ Project created with `npx Basechain@latest new --project hello`
- ✅ Dependencies installed with `yarn`
- ✅ Contracts compiled with `npx hardhat compile`

### Your Universal Contract ✅

The Universal contract in `contracts/Universal.sol` has been optimized and is ready:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {GatewayZEVM, MessageContext, UniversalContract} from "@Basechain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";

contract Universal is UniversalContract {
    GatewayZEVM public immutable GATEWAY;

    event HelloEvent(string, string);
    error Unauthorized();

    modifier onlyGateway() {
        if (msg.sender != address(GATEWAY)) revert Unauthorized();
        _;
    }

    constructor(address payable gatewayAddress) {
        GATEWAY = GatewayZEVM(gatewayAddress);
    }

    function onCall(
        MessageContext calldata /* context */,
        address /* zrc20 */,
        uint256 /* amount */,
        bytes calldata message
    ) external override onlyGateway {
        string memory name = abi.decode(message, (string));
        emit HelloEvent("Hello: ", name);
    }
}
```

## 🎯 Next Steps - Choose Your Path

### Option A: Deploy on Testnet (Recommended)

Since Foundry isn't installed, let's deploy directly to testnet:

1. **Get a funded wallet:**
   - Create a MetaMask wallet
   - Get testnet tokens from BaseChain faucet: https://labs.Basechain.com/get-Base
   - Export your private key

2. **Deploy to BaseChain Testnet:**
   ```bash
   npx ts-node commands/index.ts deploy --private-key YOUR_PRIVATE_KEY
   ```

3. **Test Cross-Chain Call from Base Sepolia:**
   ```bash
   npx Basechain evm call \
     --chain-id 84532 \
     --receiver YOUR_DEPLOYED_CONTRACT_ADDRESS \
     --private-key YOUR_PRIVATE_KEY \
     --types string \
     --values "Hello BaseChain!"
   ```

4. **Track the Transaction:**
   ```bash
   npx Basechain query cctx --hash TRANSACTION_HASH
   ```

### Option B: Install Foundry and Use Localnet

1. **Install Foundry (Windows):**
   - Download from: https://github.com/foundry-rs/foundry/releases
   - Extract and add to PATH
   - Or use WSL: `curl -L https://foundry.paradigm.xyz | bash && foundryup`

2. **Start Localnet:**
   ```bash
   npx Basechain localnet start
   ```

3. **Deploy to Localnet:**
   ```bash
   # Get addresses
   GATEWAY_BaseCHAIN=$(jq -r '.["31337"].contracts[] | select(.contractType == "gateway") | .address' ~/.Basechain/localnet/registry.json)
   PRIVATE_KEY=$(jq -r '.private_keys[0]' ~/.Basechain/localnet/anvil.json)

   # Deploy
   forge create Universal \
     --rpc-url http://localhost:8545 \
     --private-key $PRIVATE_KEY \
     --constructor-args $GATEWAY_BaseCHAIN
   ```

## 🎉 What You've Accomplished

✅ Created a BaseChain Universal App project
✅ Fixed all contract warnings and linting issues  
✅ Compiled contracts successfully
✅ Ready to deploy and test cross-chain functionality

## 🔗 Key Resources

- **BaseChain Docs:** https://www.Basechain.com/docs/
- **Testnet Faucet:** https://labs.Basechain.com/get-Base
- **Block Explorer:** https://athens.explorer.Basechain.com/
- **Contract Addresses:** https://www.Basechain.com/docs/reference/contracts/

## 💡 Understanding Your Universal App

Your contract:
1. **Receives cross-chain calls** via the `onCall` function
2. **Decodes messages** from connected chains
3. **Emits events** that can be monitored
4. **Is secured** with the `onlyGateway` modifier

The `HelloEvent` will be emitted every time someone calls your contract from a connected chain!

---

**Ready to deploy?** Choose Option A (testnet) for the quickest start, or Option B (localnet) for full development environment.
