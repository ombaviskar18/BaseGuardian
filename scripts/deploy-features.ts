import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BaseGuardian Feature Contracts...");

  // BaseChain Athens 3 Gateway Address
  const GATEWAY_ADDRESS = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";

  // Deploy Contract Analysis Contract
  console.log("\n1. Deploying ContractAnalysis contract...");
  const ContractAnalysis = await ethers.getContractFactory("ContractAnalysis");
  const contractAnalysis = await ContractAnalysis.deploy(GATEWAY_ADDRESS);
  await contractAnalysis.deployed();
  console.log(`   ContractAnalysis deployed to: ${contractAnalysis.address}`);

  // Deploy Tokenomics Contract
  console.log("\n2. Deploying Tokenomics contract...");
  const Tokenomics = await ethers.getContractFactory("Tokenomics");
  const tokenomics = await Tokenomics.deploy(GATEWAY_ADDRESS);
  await tokenomics.deployed();
  console.log(`   Tokenomics deployed to: ${tokenomics.address}`);

  // Deploy Social Analysis Contract
  console.log("\n3. Deploying SocialAnalysis contract...");
  const SocialAnalysis = await ethers.getContractFactory("SocialAnalysis");
  const socialAnalysis = await SocialAnalysis.deploy(GATEWAY_ADDRESS);
  await socialAnalysis.deployed();
  console.log(`   SocialAnalysis deployed to: ${socialAnalysis.address}`);

  // Deploy Monitoring Contract
  console.log("\n4. Deploying Monitoring contract...");
  const Monitoring = await ethers.getContractFactory("Monitoring");
  const monitoring = await Monitoring.deploy(GATEWAY_ADDRESS);
  await monitoring.deployed();
  console.log(`   Monitoring deployed to: ${monitoring.address}`);

  console.log("\n✅ All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log(`   ContractAnalysis: ${contractAnalysis.address}`);
  console.log(`   Tokenomics: ${tokenomics.address}`);
  console.log(`   SocialAnalysis: ${socialAnalysis.address}`);
  console.log(`   Monitoring: ${monitoring.address}`);

  console.log("\n🔗 BaseChain Athens 3 Network Details:");
  console.log(`   RPC URL: https://Basechain-athens-evm.blockpi.network/v1/rpc/public`);
  console.log(`   Chain ID: 7001`);
  console.log(`   Currency: aBase`);
  console.log(`   Explorer: https://athens3.Basescan.io`);

  console.log("\n💰 Payment Required: 0.01 aBase per feature");

  // Save contract addresses to a file for frontend integration
  const contractAddresses = {
    ContractAnalysis: contractAnalysis.address,
    Tokenomics: tokenomics.address,
    SocialAnalysis: socialAnalysis.address,
    Monitoring: monitoring.address,
    Gateway: GATEWAY_ADDRESS,
    Network: {
      name: "BaseChain Athens 3",
      rpcUrl: "https://Basechain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      currency: "aBase",
      explorer: "https://athens3.Basescan.io"
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    './contract-addresses.json', 
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("\n📄 Contract addresses saved to: contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
