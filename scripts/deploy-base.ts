import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Base Guardian contracts to Base Sepolia...");

  // Deploy BaseContractAnalysis
  console.log("Deploying BaseContractAnalysis...");
  const BaseContractAnalysis = await ethers.getContractFactory("BaseContractAnalysis");
  const contractAnalysis = await BaseContractAnalysis.deploy();
  await contractAnalysis.deployed();
  const contractAnalysisAddress = contractAnalysis.address;
  console.log("BaseContractAnalysis deployed to:", contractAnalysisAddress);

  // Deploy BaseMonitoring
  console.log("Deploying BaseMonitoring...");
  const BaseMonitoring = await ethers.getContractFactory("BaseMonitoring");
  const monitoring = await BaseMonitoring.deploy();
  await monitoring.deployed();
  const monitoringAddress = monitoring.address;
  console.log("BaseMonitoring deployed to:", monitoringAddress);

  // Deploy BaseSocialAnalysis
  console.log("Deploying BaseSocialAnalysis...");
  const BaseSocialAnalysis = await ethers.getContractFactory("BaseSocialAnalysis");
  const socialAnalysis = await BaseSocialAnalysis.deploy();
  await socialAnalysis.deployed();
  const socialAnalysisAddress = socialAnalysis.address;
  console.log("BaseSocialAnalysis deployed to:", socialAnalysisAddress);

  // Deploy BaseTokenomics
  console.log("Deploying BaseTokenomics...");
  const BaseTokenomics = await ethers.getContractFactory("BaseTokenomics");
  const tokenomics = await BaseTokenomics.deploy();
  await tokenomics.deployed();
  const tokenomicsAddress = tokenomics.address;
  console.log("BaseTokenomics deployed to:", tokenomicsAddress);

  // Save deployment addresses
  const deploymentInfo = {
    BaseContractAnalysis: contractAnalysisAddress,
    BaseMonitoring: monitoringAddress,
    BaseSocialAnalysis: socialAnalysisAddress,
    BaseTokenomics: tokenomicsAddress,
    Network: {
      name: "Base Sepolia",
      rpcUrl: "https://sepolia.base.org",
      chainId: 84532,
      currency: "ETH",
      explorer: "https://sepolia.basescan.org"
    },
    deployedAt: new Date().toISOString()
  } as const;

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Base Sepolia");
  console.log("Chain ID: 84532");
  console.log("RPC URL: https://sepolia.base.org");
  console.log("Explorer: https://sepolia.basescan.org");
  console.log("\nContract Addresses:");
  console.log("BaseContractAnalysis:", contractAnalysisAddress);
  console.log("BaseMonitoring:", monitoringAddress);
  console.log("BaseSocialAnalysis:", socialAnalysisAddress);
  console.log("BaseTokenomics:", tokenomicsAddress);

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    "base-contract-addresses.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to base-contract-addresses.json");

  // Verify contracts on BaseScan
  console.log("\n=== VERIFICATION ===");
  console.log("To verify contracts on BaseScan, run:");
  console.log(`npx hardhat verify --network baseSepolia ${contractAnalysisAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${monitoringAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${socialAnalysisAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${tokenomicsAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
