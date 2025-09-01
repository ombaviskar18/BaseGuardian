import { ethers } from 'ethers';

// Contract addresses from Base Sepolia deployment (Updated with 0.0001 ETH payment)
export const CONTRACT_ADDRESSES = {
  ContractAnalysis: "0x1edBBfc2a68428A556212dF0c54263b6a251B74d",
  Tokenomics: "0xEb470F2fc016C1770415a8d970F7cF09837c18Bc",
  SocialAnalysis: "0x072fa2ce02EcEFDC123bAf57A369581247B5E88c",
  Monitoring: "0xd5918c006Dc5ff19d30E988D11FAaC31f8b6ee2B",
};

// Network configuration (Base Sepolia)
export const NETWORK_CONFIG = {
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  chainId: 84532,
  currency: "ETH",
  explorer: "https://sepolia.basescan.org",
};

// Contract ABIs (simplified for the main functions)
export const CONTRACT_ABI = [
  // Request analysis with payment
  "function requestContractAnalysis(string contractAddress) external payable",
  "function requestTokenomicsAnalysis(string tokenAddress) external payable",
  "function requestSocialAnalysis(string projectName) external payable",
  "function requestMonitoring(string targetAddress) external payable",

  // Get user requests (note: tuple field names vary per contract; reading as generic)
  "function getUserRequests(address user) external view returns (tuple(address user, string target, uint256 payment, bool completed, uint256 riskScore, string analysis, uint256 timestamp)[])",

  // Events
  "event ContractAnalysisRequested(address indexed user, string contractAddress, uint256 payment)",
  "event TokenomicsAnalysisRequested(address indexed user, string tokenAddress, uint256 payment)",
  "event SocialAnalysisRequested(address indexed user, string projectName, uint256 payment)",
  "event MonitoringRequested(address indexed user, string targetAddress, uint256 payment)",

  "event ContractAnalysisCompleted(address indexed user, string contractAddress, uint256 riskScore, string analysis)",
  "event TokenomicsAnalysisCompleted(address indexed user, string tokenAddress, uint256 riskScore, string analysis)",
  "event SocialAnalysisCompleted(address indexed user, string projectName, uint256 riskScore, string analysis)",
  "event MonitoringCompleted(address indexed user, string targetAddress, uint256 riskScore, string analysis)",

  "event PaymentReceived(address indexed user, uint256 amount)",
  "event AlertTriggered(address indexed user, string targetAddress, string alertType, string message)",
];

// Contract interaction utilities
export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      return true;
    }
    return false;
  }

  async requestContractAnalysis(contractAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ContractAnalysis,
      CONTRACT_ABI,
      this.signer
    );

    const payment = ethers.parseEther("0.0001");
    const tx = await contract.requestContractAnalysis(contractAddress, { value: payment });
    return await tx.wait();
  }

  async requestTokenomicsAnalysis(tokenAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.Tokenomics,
      CONTRACT_ABI,
      this.signer
    );

    const payment = ethers.parseEther("0.0001");
    const tx = await contract.requestTokenomicsAnalysis(tokenAddress, { value: payment });
    return await tx.wait();
  }

  async requestSocialAnalysis(projectName: string) {
    if (!this.signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.SocialAnalysis,
      CONTRACT_ABI,
      this.signer
    );

    const payment = ethers.parseEther("0.0001");
    const tx = await contract.requestSocialAnalysis(projectName, { value: payment });
    return await tx.wait();
  }

  async requestMonitoring(targetAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.Monitoring,
      CONTRACT_ABI,
      this.signer
    );

    const payment = ethers.parseEther("0.0001");
    const tx = await contract.requestMonitoring(targetAddress, { value: payment });
    return await tx.wait();
  }

  async getUserRequests(contractType: 'ContractAnalysis' | 'Tokenomics' | 'SocialAnalysis' | 'Monitoring', userAddress: string) {
    if (!this.provider) throw new Error("Provider not connected");

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES[contractType],
      CONTRACT_ABI,
      this.provider
    );

    return await contract.getUserRequests(userAddress);
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getNetwork() {
    if (!this.provider) return null;
    return await this.provider.getNetwork();
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Utility functions
export const formatEther = (wei: bigint) => ethers.formatEther(wei);
export const parseEther = (ether: string) => ethers.parseEther(ether);

// Network switching utility (Base Sepolia)
export async function switchToBaseSepolia() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.name,
              nativeCurrency: { name: NETWORK_CONFIG.currency, symbol: NETWORK_CONFIG.currency, decimals: 18 },
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.explorer],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Base Sepolia to wallet:', addError);
          return false;
        }
      }
      return false;
    }
  }
  return false;
}
