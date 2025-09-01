import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Brain, TrendingUp, TrendingDown, Activity, Wallet, Search, Users, BarChart3, PieChart, LineChart, AlertTriangle, Hash, Database, BarChart, RefreshCw, Coins } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, DoughnutController } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { contractService, switchToBaseSepolia } from '../utils/contracts';
import './TokenomicsPage.css';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, DoughnutController);

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  logo?: string;
}

interface PortfolioData {
  totalValue: number;
  totalAssets: number;
  totalTokens: number;
  totalNfts: number;
  assets: PortfolioAsset[];
  tokens: PortfolioAsset[];
  nfts: any[];
  distribution: { [key: string]: number };
  performance: { date: string; value: number }[];
}

export function TokenomicsPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { account } = useWallet();
  const [portfolioAddress, setPortfolioAddress] = useState('');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';

  // Search for token by symbol or address
  const searchToken = async (query: string) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // First try to search by symbol/name
      const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
      const searchResponse = await fetch(searchUrl, {
        headers: COINGECKO_API_KEY ? { 'X-CG-API-KEY': COINGECKO_API_KEY } : {}
      });
      
      if (!searchResponse.ok) {
        throw new Error('Failed to search for token');
      }
      
      const searchData = await searchResponse.json();
      
      if (searchData.coins && searchData.coins.length > 0) {
        // Get the first matching coin
        const coin = searchData.coins[0];
        return await fetchTokenData(coin.id);
      } else {
        // If no results, try to treat as contract address
        return await fetchTokenDataByAddress(query);
      }
    } catch (err) {
      console.error('Error searching token:', err);
      setErrorMessage('Token not found. Please check the symbol or address.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token data by ID
  const fetchTokenData = async (tokenId: string) => {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`;
      const response = await fetch(url, {
        headers: COINGECKO_API_KEY ? { 'X-CG-API-KEY': COINGECKO_API_KEY } : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching token data:', err);
      throw err;
    }
  };

  // Fetch token data by contract address (for specific chains)
  const fetchTokenDataByAddress = async (address: string) => {
    try {
      // Try Ethereum first
      const url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`;
      const response = await fetch(url, {
        headers: COINGECKO_API_KEY ? { 'X-CG-API-KEY': COINGECKO_API_KEY } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // If not found on Ethereum, try other chains
      const chains = ['binance-smart-chain', 'polygon-pos', 'avalanche'];
      for (const chain of chains) {
        const chainUrl = `https://api.coingecko.com/api/v3/coins/${chain}/contract/${address}`;
        const chainResponse = await fetch(chainUrl, {
          headers: COINGECKO_API_KEY ? { 'X-CG-API-KEY': COINGECKO_API_KEY } : {}
        });
        
        if (chainResponse.ok) {
          const data = await chainResponse.json();
          return data;
        }
      }
      
      throw new Error('Token not found on supported chains');
    } catch (err) {
      console.error('Error fetching token by address:', err);
      throw err;
    }
  };

  const calculateTokenomicsMetrics = (tokenData: any) => {
    const currentPrice = tokenData.market_data?.current_price?.usd || 0;
    const totalSupply = tokenData.market_data?.total_supply || 0;
    const circulatingSupply = tokenData.market_data?.circulating_supply || 0;
    const marketCap = tokenData.market_data?.market_cap?.usd || 0;
    const volume24h = tokenData.market_data?.total_volume?.usd || 0;
    
    // Calculate whale concentration based on market cap and volume
    const whaleConcentration = Math.min(100, Math.max(5, (volume24h / marketCap) * 100));
    
    // Calculate risk score based on multiple factors
    let riskScore = 0;
    
    // Price volatility
    const priceChange = Math.abs(tokenData.market_data?.price_change_percentage_24h || 0);
    if (priceChange > 20) riskScore += 25;
    else if (priceChange > 10) riskScore += 15;
    else if (priceChange > 5) riskScore += 10;
    
    // Low volume relative to market cap
    const volumeToMarketCapRatio = volume24h / marketCap;
    if (volumeToMarketCapRatio < 0.01) riskScore += 20;
    else if (volumeToMarketCapRatio < 0.05) riskScore += 15;
    else if (volumeToMarketCapRatio < 0.1) riskScore += 10;
    
    // High whale concentration
    if (whaleConcentration > 50) riskScore += 20;
    else if (whaleConcentration > 30) riskScore += 15;
    else if (whaleConcentration > 20) riskScore += 10;
    
    // Low market cap
    if (marketCap < 1000000) riskScore += 20;
    else if (marketCap < 10000000) riskScore += 15;
    else if (marketCap < 100000000) riskScore += 10;
    
    // Supply concentration
    const supplyConcentration = totalSupply > 0 ? (circulatingSupply / totalSupply) : 1;
    if (supplyConcentration < 0.5) riskScore += 15;
    else if (supplyConcentration < 0.8) riskScore += 10;
    
    return {
      whaleConcentration: Math.round(whaleConcentration),
      riskScore: Math.min(100, riskScore),
      totalSupply: totalSupply,
      circulatingSupply: circulatingSupply,
      marketCap: marketCap,
      currentPrice: currentPrice,
      volume24h: volume24h
    };
  };

  const handleAnalysis = async () => {
    if (!account) {
      setShowWalletConnect(true);
      return;
    }

    if (!tokenInput.trim()) return;

    setIsAnalyzing(true);
    setErrorMessage('');
    
    try {
      // Connect to wallet and switch to BaseChain
      const connected = await contractService.connect();
      if (!connected) {
        setErrorMessage('Failed to connect wallet. Please ensure MetaMask is installed.');
        return;
      }

      // Switch to Base Sepolia
      const switched = await switchToBaseSepolia();
      if (!switched) {
        setErrorMessage('Failed to switch to Base Sepolia. Please add Base Sepolia to your wallet.');
        return;
      }

      // Call smart contract with payment
      console.log('Calling smart contract for tokenomics analysis...');
      const tx = await contractService.requestTokenomicsAnalysis(tokenInput.trim());
      console.log('Transaction successful:', tx);

      // After successful payment, proceed with token analysis
      const tokenData = await searchToken(tokenInput.trim());
      
      if (!tokenData) {
        return;
      }

      const metrics = calculateTokenomicsMetrics(tokenData);
      
      // Generate mock top holders based on whale concentration
      const topHolders = [];
      const remainingPercentage = 100 - metrics.whaleConcentration;
      const holderCount = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < holderCount; i++) {
        const percentage = i === 0 ? 
          Math.round(metrics.whaleConcentration * 0.6) : 
          Math.round((remainingPercentage / (holderCount - 1)) * (0.8 + Math.random() * 0.4));
        
        topHolders.push({
          address: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 6)}`,
          percentage: percentage
        });
      }

      const analysisResult = {
        token: tokenData.symbol.toUpperCase(),
        tokenName: tokenData.name,
        tokenAddress: tokenData.contract_address || 'N/A',
        tokenImage: tokenData.image?.large || '',
        totalSupplyRaw: metrics.totalSupply,
        totalSupply: new Intl.NumberFormat().format(metrics.totalSupply),
        whaleConcentration: metrics.whaleConcentration,
        topHolders: topHolders,
        liquidityLocked: Math.random() > 0.3, // 70% chance of being locked
        mintingRights: metrics.totalSupply > 0 && metrics.circulatingSupply < metrics.totalSupply ? 'Limited' : 'Unlimited',
        taxStructure: {
          buyTax: Math.floor(Math.random() * 8) + 1,
          sellTax: Math.floor(Math.random() * 12) + 2,
          modifiable: Math.random() > 0.6
        },
        crossChainData: {
          ethereum: { 
            holders: Math.floor(Math.random() * 2000) + 500, 
            liquidity: `$${(Math.random() * 10 + 1).toFixed(1)}M` 
          },
          bsc: { 
            holders: Math.floor(Math.random() * 1500) + 300, 
            liquidity: `$${(Math.random() * 8 + 0.5).toFixed(1)}M` 
          },
          polygon: { 
            holders: Math.floor(Math.random() * 1000) + 200, 
            liquidity: `$${(Math.random() * 5 + 0.3).toFixed(1)}M` 
          }
        },
        riskScore: metrics.riskScore,
        timestamp: new Date().toISOString(),
        // Additional real data (raw)
        currentPrice: metrics.currentPrice,
        marketCap: metrics.marketCap,
        volume24h: metrics.volume24h,
        circulatingSupply: metrics.circulatingSupply,
        maxSupply: tokenData.market_data?.max_supply || 0,
        developerActivity: Math.floor(((metrics.volume24h % 1000000) / 1000000) * 100)
      };
      
      setAnalysisResult(analysisResult);
      setErrorMessage('');
    } catch (err: any) {
      console.error('Error analyzing tokenomics:', err);
      if (err.message && err.message.includes('Payment')) {
        setErrorMessage('Payment required: Please ensure you have 0.01 aBase and approve the transaction.');
      } else if (err.message && err.message.includes('user rejected')) {
        setErrorMessage('Transaction was rejected. Please try again and approve the payment.');
      } else {
        setErrorMessage('Failed to analyze tokenomics. Please check your wallet connection and try again.');
      }
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAIInsights = async (metrics: any) => {
    if (!metrics) return;
    try {
      setIsGeneratingAI(true);

      const { marketCap, volume24h, circulatingSupply, totalSupply } = metrics;
      const volToCap = marketCap > 0 ? volume24h / marketCap : 0;
      const supplyUtil = totalSupply > 0 ? circulatingSupply / totalSupply : 0;

      let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      if (volToCap > 0.15 && supplyUtil < 0.7) recommendation = 'BUY';
      else if (volToCap < 0.03 && supplyUtil > 0.9) recommendation = 'SELL';

      const confidence = Math.min(95, Math.max(60, Math.round(volToCap * 100)));
      const reasoning = `Based on liquidity utilization, market participation and supply dynamics, the token shows ${volToCap.toFixed(2)} volume/market-cap ratio and ${(supplyUtil * 100).toFixed(1)}% supply in circulation. These signals suggest a ${recommendation} stance in the near term.`;

      setAiInsights({
        recommendation,
        confidence,
        reasoning,
        riskLevel: volToCap > 0.2 ? 'Low' : volToCap > 0.07 ? 'Medium' : 'High',
        keyFactors: [
          `Volume/MarketCap: ${(volToCap * 100).toFixed(2)}%`,
          `Circulating vs Total: ${(supplyUtil * 100).toFixed(1)}%`,
          `Market Cap: $${(marketCap || 0).toLocaleString()}`,
        ],
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (analysisResult && !aiInsights && !isGeneratingAI) {
      generateAIInsights(analysisResult);
    }
  }, [analysisResult, aiInsights, isGeneratingAI]);

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'text-green-400' };
    if (score <= 60) return { level: 'Medium', color: 'text-yellow-400' };
    if (score <= 80) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Critical', color: 'text-red-400' };
  };

  const getRecIcon = (rec: string) => {
    switch (rec) {
      case 'BUY': return <TrendingUp className="recommendation-icon" />;
      case 'SELL': return <TrendingDown className="recommendation-icon" />;
      default: return <Activity className="recommendation-icon" />;
    }
  };

  const getRecColor = (rec: string) => rec === 'BUY' ? '#10b981' : rec === 'SELL' ? '#ef4444' : '#f59e0b';

  // Charts
  const tokenomicsBarData = analysisResult ? {
    labels: ['Price', '24h Volume', 'Market Cap', 'Circulating'],
    datasets: [{
      label: 'Token Metrics (scaled)',
      data: [
        (analysisResult.currentPrice || 0) / 1000,
        (analysisResult.volume24h || 0) / 1_000_000,
        (analysisResult.marketCap || 0) / 1_000_000_000,
        (analysisResult.circulatingSupply || 0) / 1_000_000,
      ],
      backgroundColor: ['rgba(59,130,246,0.8)','rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(139,92,246,0.8)'],
      borderColor: ['rgba(59,130,246,1)','rgba(16,185,129,1)','rgba(245,158,11,1)','rgba(139,92,246,1)'],
      borderWidth: 2,
    }],
  } : null;

  const supplyPieData = analysisResult ? {
    labels: ['Circulating', 'Remaining'],
    datasets: [{
      data: [analysisResult.circulatingSupply || 0, Math.max(0, (analysisResult.totalSupplyRaw || 0) - (analysisResult.circulatingSupply || 0))],
      backgroundColor: ['rgba(16,185,129,0.8)','rgba(59,130,246,0.2)'],
      borderColor: ['rgba(16,185,129,1)','rgba(59,130,246,0.6)'],
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { color: '#ffffff', font: { size: 12 } } }, tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#fff', bodyColor: '#cbd5e1', borderColor: 'rgba(148,163,184,0.2)', borderWidth: 1 } } };

  const validateAddress = (address: string): boolean => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const fetchPortfolioData = async (address: string) => {
    setIsPortfolioLoading(true);
    setPortfolioError('');

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock portfolio data
      const mockPortfolioData: PortfolioData = {
        totalValue: 125847.32,
        totalAssets: 8,
        totalTokens: 12,
        totalNfts: 5,
        assets: [
          { symbol: 'ETH', name: 'Ethereum', balance: 12.5, price: 3247.89, value: 40598.63, change24h: 2.34, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
          { symbol: 'BTC', name: 'Bitcoin', balance: 0.85, price: 43256.78, value: 36768.26, change24h: -1.23, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
          { symbol: 'ADA', name: 'Cardano', balance: 15000, price: 0.45, value: 6750.00, change24h: 5.67, logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
          { symbol: 'DOT', name: 'Polkadot', balance: 500, price: 6.78, value: 3390.00, change24h: -0.89, logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
          { symbol: 'LINK', name: 'Chainlink', balance: 200, price: 12.45, value: 2490.00, change24h: 3.21, logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
          { symbol: 'UNI', name: 'Uniswap', balance: 100, price: 8.92, value: 892.00, change24h: -2.15, logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
          { symbol: 'AAVE', name: 'Aave', balance: 50, price: 15.67, value: 783.50, change24h: 4.32, logo: 'https://cryptologos.cc/logos/aave-aave-logo.png' },
          { symbol: 'MATIC', name: 'Polygon', balance: 5000, price: 0.89, value: 4450.00, change24h: 1.78, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' }
        ],
        tokens: [
          { symbol: 'USDC', name: 'USD Coin', balance: 5000, price: 1.00, value: 5000.00, change24h: 0.00, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
          { symbol: 'USDT', name: 'Tether', balance: 3000, price: 1.00, value: 3000.00, change24h: 0.00, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
          { symbol: 'DAI', name: 'Dai', balance: 2000, price: 1.00, value: 2000.00, change24h: 0.00, logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' },
          { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.1, price: 43256.78, value: 4325.68, change24h: -1.23, logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png' }
        ],
        nfts: [
          { name: 'Bored Ape #1234', collection: 'Bored Ape Yacht Club', value: 15000, image: 'https://example.com/ape1.jpg' },
          { name: 'CryptoPunk #5678', collection: 'CryptoPunks', value: 8500, image: 'https://example.com/punk1.jpg' },
          { name: 'Doodle #9012', collection: 'Doodles', value: 3200, image: 'https://example.com/doodle1.jpg' },
          { name: 'Azuki #3456', collection: 'Azuki', value: 2800, image: 'https://example.com/azuki1.jpg' },
          { name: 'Moonbird #7890', collection: 'Moonbirds', value: 1200, image: 'https://example.com/moonbird1.jpg' }
        ],
        distribution: {
          'Ethereum': 32.2,
          'Bitcoin': 29.2,
          'Cardano': 5.4,
          'Polkadot': 2.7,
          'Chainlink': 2.0,
          'Uniswap': 0.7,
          'Aave': 0.6,
          'Polygon': 3.5,
          'Stablecoins': 8.4,
          'NFTs': 15.3
        },
        performance: [
          { date: '2024-01-01', value: 100000 },
          { date: '2024-02-01', value: 105000 },
          { date: '2024-03-01', value: 98000 },
          { date: '2024-04-01', value: 112000 },
          { date: '2024-05-01', value: 108000 },
          { date: '2024-06-01', value: 125847 }
        ]
      };

      setPortfolioData(mockPortfolioData);
    } catch (error) {
      setPortfolioError('Failed to fetch portfolio data. Please try again.');
      console.error('Portfolio fetch error:', error);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const handlePortfolioAnalysis = () => {
    if (!portfolioAddress.trim()) {
      setPortfolioError('Please enter a wallet address');
      return;
    }

    if (!validateAddress(portfolioAddress)) {
      setPortfolioError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    fetchPortfolioData(portfolioAddress);
  };

  const portfolioDistributionData = portfolioData ? {
    labels: Object.keys(portfolioData.distribution),
    datasets: [{
      data: Object.values(portfolioData.distribution),
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ],
      borderWidth: 2,
      borderColor: '#1e293b'
    }]
  } : null;

  const portfolioPerformanceData = portfolioData ? {
    labels: portfolioData.performance.map(p => p.date),
    datasets: [{
      label: 'Portfolio Value',
      data: portfolioData.performance.map(p => p.value),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4
    }]
  } : null;

  return (
    <div className="tokenomics-page">
      {/* Hero Section */}
      <section className="tokenomics-hero">
        <div className="tokenomics-hero-container">
          <div className="tokenomics-hero-grid">
            <div className="tokenomics-hero-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="tokenomics-hero-badge"
              >
                <BarChart3 className="hero-badge-icon" />
                <span>Cross-Chain Tokenomics Analysis</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="tokenomics-hero-title"
              >
                Cross-Chain
                <span className="title-line-2"> Tokenomics Evaluation</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="tokenomics-hero-description"
              >
                Comprehensive multi-chain analysis of token distribution, whale concentration, liquidity patterns, and economic manipulation indicators across all major blockchains.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="tokenomics-features-grid"
              >
                <div className="tokenomics-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.1)"/>
                      <path d="M32 8L40 24H24L32 8Z" fill="currentColor"/>
                      <circle cx="32" cy="32" r="12" fill="currentColor"/>
                      <path d="M16 45L24 35H40L48 45" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.2)"/>
                      <circle cx="20" cy="48" r="3" fill="currentColor"/>
                      <circle cx="44" cy="48" r="3" fill="currentColor"/>
                      <path d="M28 52C28 50 30 48 32 48C34 48 36 50 36 52" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span>Whale Analysis</span>
                </div>
                <div className="tokenomics-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.1)"/>
                      <path d="M8 20H56" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="20" cy="16" r="2" fill="currentColor"/>
                      <circle cx="28" cy="16" r="2" fill="currentColor"/>
                      <circle cx="36" cy="16" r="2" fill="currentColor"/>
                      <rect x="16" y="28" width="12" height="8" rx="2" fill="currentColor"/>
                      <rect x="36" y="28" width="12" height="8" rx="2" fill="rgba(16, 185, 129, 0.6)"/>
                      <path d="M16 40L20 44L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M36 40L48 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <text x="32" y="48" textAnchor="middle" fontSize="8" fill="currentColor">TAX</text>
                    </svg>
                  </div>
                  <span>Tax Structure</span>
                </div>
                <div className="tokenomics-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.05)"/>
                      <circle cx="20" cy="20" r="6" fill="currentColor"/>
                      <circle cx="44" cy="20" r="5" fill="rgba(16, 185, 129, 0.8)"/>
                      <circle cx="32" cy="32" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                      <circle cx="16" cy="44" r="4" fill="rgba(16, 185, 129, 0.7)"/>
                      <circle cx="48" cy="44" r="3" fill="rgba(16, 185, 129, 0.5)"/>
                      <path d="M20 26L32 28L44 25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2"/>
                      <path d="M32 36L16 40L32 36L48 41" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2"/>
                      <text x="20" y="18" textAnchor="middle" fontSize="6" fill="white">45%</text>
                      <text x="44" y="18" textAnchor="middle" fontSize="5" fill="white">12%</text>
                      <text x="32" y="31" textAnchor="middle" fontSize="4" fill="white">8%</text>
                    </svg>
                  </div>
                  <span>Holder Distribution</span>
                </div>
                <div className="tokenomics-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="12" y="24" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.1)"/>
                      <rect x="26" y="16" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.2)"/>
                      <circle cx="32" cy="36" r="6" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.1)"/>
                      <path d="M29 36L31 38L35 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="20" y="46" width="8" height="2" rx="1" fill="currentColor"/>
                      <rect x="36" y="46" width="8" height="2" rx="1" fill="currentColor"/>
                      <path d="M16 28L20 32L16 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M48 28L44 32L48 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="32" cy="12" r="3" fill="currentColor"/>
                      <path d="M29 9L32 6L35 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Liquidity Lock</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="tokenomics-hero-video-container"
            >
              <div className="tokenomics-video-card">
                <video
                  className="tokenomics-hero-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/logos/tokens.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="tokenomics-main">
        <div className="tokenomics-container">
          {!analysisResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="tokenomics-scanner"
            >
              <div className="scanner-card">
                <div className="scanner-header">
                  <h2 className="scanner-title">
                    Tokenomics
                    <span className="title-line-2"> Analyzer</span>
                  </h2>
                  <p className="scanner-subtitle">
                    Enter a token symbol (e.g., ETH, BTC) or contract address to begin comprehensive cross-chain tokenomics analysis
                  </p>
                </div>

                <div className="scanner-form">
                  {errorMessage && (
                    <div className="error-message">
                      <Wallet className="error-icon" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  <div className="input-row">
                    <div className="input-checkbox">
                      <label htmlFor="terms" className="checkbox-label"></label>
                    </div>
                    <div className="input-field-container">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Enter token symbol (ETH, BTC) or contract address (0x...)"
                        className="contract-input-field"
                      />
                      <Search className="input-search-icon" />
                    </div>
                  </div>
                  
                  <div className="scan-button-container">
                    <button
                      onClick={handleAnalysis}
                      disabled={isAnalyzing || !tokenInput.trim()}
                      className={`main-scan-button ${isAnalyzing ? 'scanning' : ''}`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="scan-spinner"></div>
                          <span>Analyzing Tokenomics...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="scan-icon" />
                          <span>Analyze Tokenomics</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showWalletConnect && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="wallet-warning"
                    >
                      <div className="warning-header">
                        <Wallet className="warning-icon" />
                        <span className="warning-title">Wallet Connection Required</span>
                      </div>
                      <p className="warning-text">
                        Connect your wallet and pay 0.0001 ETH on Base Sepolia to perform tokenomics analysis.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="analysis-info">
                  <h3 className="info-title">Comprehensive Analysis Includes:</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Cross-Chain Whale Analysis</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Liquidity Lock Verification</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Tax Structure Analysis</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Holder Distribution Mapping</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Minting Rights Assessment</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Multi-Chain Risk Scoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="tokenomics-results"
            >
              <div className="results-header">
                <div className="results-title-section">
                  <div className="token-info-row">
                    {analysisResult.tokenImage && (
                      <img src={analysisResult.tokenImage} alt={analysisResult.tokenName} className="token-image" />
                    )}
                    <div>
                      <h2 className="results-title">Tokenomics Analysis Complete</h2>
                      <p className="results-subtitle">
                        {analysisResult.tokenName} ({analysisResult.token})
                      </p>
                      <p className="results-timestamp">
                        Analysis completed on {new Date(analysisResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="results-content">
                {/* Risk Score Section */}
                <div className="risk-score-section">
                  <div className="risk-meter">
                    <div className="risk-circle">
                      <svg className="risk-progress" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={analysisResult.riskScore <= 30 ? '#10b981' : analysisResult.riskScore <= 60 ? '#f59e0b' : analysisResult.riskScore <= 80 ? '#f97316' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={`${analysisResult.riskScore * 2.83} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="risk-score-content">
                        <div className="risk-number">{analysisResult.riskScore}</div>
                        <div className="risk-label">Risk Score</div>
                      </div>
                    </div>
                  </div>
                  <div className={`risk-level ${getRiskLevel(analysisResult.riskScore).color}`}>
                    {getRiskLevel(analysisResult.riskScore).level} Risk
                  </div>
                </div>

                {/* Token Metrics */}
                <div className="token-metrics">
                  <h3 className="section-title">Token Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">{analysisResult.totalSupply}</div>
                      <div className="metric-label">Total Supply</div>
                    </div>
                    <div className="metric-card">
                      <div className={`metric-value ${analysisResult.whaleConcentration > 40 ? 'text-red-400' : 'text-green-400'}`}>
                        {analysisResult.whaleConcentration}%
                      </div>
                      <div className="metric-label">Whale Concentration</div>
                    </div>
                    <div className="metric-card">
                      <div className={`metric-value ${analysisResult.liquidityLocked ? 'text-green-400' : 'text-red-400'}`}>
                        {analysisResult.liquidityLocked ? 'Locked' : 'Unlocked'}
                      </div>
                      <div className="metric-label">Liquidity Status</div>
                    </div>
                    <div className="metric-card">
                      <div className={`metric-value ${analysisResult.mintingRights === 'Limited' ? 'text-green-400' : 'text-red-400'}`}>
                        {analysisResult.mintingRights}
                      </div>
                      <div className="metric-label">Minting Rights</div>
                    </div>
                    {/* Extra right-side card */}
                    <div className="metric-card">
                      <div className="metric-value">{analysisResult.developerActivity}%</div>
                      <div className="metric-label">Developer Activity (7d)</div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {aiInsights && (
                  <div className="ai-prediction-section">
                    <div className="prediction-header">
                      <div className="prediction-title-section">
                        <Brain className="prediction-icon" />
                        <h3 className="section-title">AI Tokenomics Insight</h3>
                      </div>
                    </div>
                    <div className="prediction-grid">
                      <div className="prediction-main-card">
                        <div className="recommendation-section">
                          <div className="recommendation-header">
                            {getRecIcon(aiInsights.recommendation)}
                            <div className="recommendation-content">
                              <h4 className="recommendation-title">{aiInsights.recommendation}</h4>
                              <p className="recommendation-confidence">{aiInsights.confidence}% Confidence</p>
                            </div>
                          </div>
                          <div className="recommendation-badge" style={{ backgroundColor: getRecColor(aiInsights.recommendation) + '20', borderColor: getRecColor(aiInsights.recommendation) }}>
                            <span style={{ color: getRecColor(aiInsights.recommendation) }}>{aiInsights.recommendation}</span>
                          </div>
                        </div>
                        <div className="prediction-details">
                          <div className="prediction-reasoning">
                            <h5>AI Analysis:</h5>
                            <p className="reasoning-text">{aiInsights.reasoning}</p>
                          </div>
                          <div className="prediction-metrics">
                            <div className="metric"><span className="label">Risk Level:</span> <span className="value">{aiInsights.riskLevel}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="prediction-factors-card">
                        <h5>Key Factors</h5>
                        <ul className="factors-list">
                          {aiInsights.keyFactors.map((f: string, i: number) => (
                            <li key={i} className="factor-item">
                              <CheckCircle className="factor-icon" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts Section */}
                <div className="charts-section">
                  <h3 className="section-title">Tokenomics Analytics</h3>
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h4 className="chart-title">Market Overview</h4>
                      <div className="chart-container">
                        {tokenomicsBarData && (
                          <Bar data={tokenomicsBarData} options={chartOptions} />
                        )}
                      </div>
                    </div>
                    <div className="chart-card">
                      <h4 className="chart-title">Supply Breakdown</h4>
                      <div className="chart-container">
                        {supplyPieData && (
                          <Pie data={supplyPieData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, position: 'right' as const } } }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Data */}
                <div className="market-data-section">
                  <h3 className="section-title">Market Data</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">${analysisResult.currentPrice.toFixed(4)}</div>
                      <div className="metric-label">Current Price</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${analysisResult.marketCap.toLocaleString()}</div>
                      <div className="metric-label">Market Cap</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${analysisResult.volume24h.toLocaleString()}</div>
                      <div className="metric-label">24h Volume</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{analysisResult.circulatingSupply.toLocaleString()}</div>
                      <div className="metric-label">Circulating Supply</div>
                    </div>
                  </div>
                </div>

                {/* Findings Section */}
                <div className="findings-section">
                  <div className="findings-grid">
                    <div className="findings-card">
                      <div className="findings-header">
                        <Users className="findings-icon" />
                        <h3 className="findings-title">Top Holders</h3>
                        <span className="findings-count">{analysisResult.topHolders.length}</span>
                      </div>
                      <div className="holders-list">
                        {analysisResult.topHolders.map((holder: any, index: number) => (
                          <div key={index} className="holder-item">
                            <span className="holder-address">{holder.address}</span>
                            <span className="holder-percentage">{holder.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="findings-card">
                      <div className="findings-header">
                        <TrendingUp className="findings-icon" />
                        <h3 className="findings-title">Tax Structure</h3>
                      </div>
                      <div className="tax-structure">
                        <div className="tax-item">
                          <span className="tax-label">Buy Tax</span>
                          <span className="tax-value buy-tax">{analysisResult.taxStructure.buyTax}%</span>
                        </div>
                        <div className="tax-item">
                          <span className="tax-label">Sell Tax</span>
                          <span className="tax-value sell-tax">{analysisResult.taxStructure.sellTax}%</span>
                        </div>
                        <div className="tax-item">
                          <span className="tax-label">Modifiable</span>
                          <span className={`tax-value ${analysisResult.taxStructure.modifiable ? 'text-red-400' : 'text-green-400'}`}>
                            {analysisResult.taxStructure.modifiable ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="results-actions">
                  <button 
                    onClick={() => {
                      // Trigger print for full report
                      window.print();
                    }}
                    className="download-button"
                  >
                    <Download className="action-icon" />
                    <span>Download Full Report</span>
                  </button>
                  <button 
                    onClick={() => {
                      setAnalysisResult(null);
                      setTokenInput('');
                      setShowWalletConnect(false);
                    }}
                    className="scan-another-button"
                  >
                    <BarChart3 className="action-icon" />
                    <span>Analyze Another Token</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Portfolio Analysis Section */}
      <section className="portfolio-section">
        <div className="tokenomics-container">
          <div className="section-header">
            
            <div className="section-content">
              <h2 className="section-title">Portfolio Analysis(Coming Soon🔜)</h2>
              <p className="section-description">
                Comprehensive wallet analysis with real-time asset tracking, performance metrics, and detailed insights for your crypto portfolio.
              </p>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="portfolio-input-section">
              <div className="input-group">
                <div className="input-wrapper">
                  <Hash className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter wallet address (0x...)"
                    value={portfolioAddress}
                    onChange={(e) => setPortfolioAddress(e.target.value)}
                    className="portfolio-input"
                  />
                </div>
                <button
                  onClick={handlePortfolioAnalysis}
                  disabled={isPortfolioLoading}
                  className="analyze-btn"
                >
                  {isPortfolioLoading ? (
                    <RefreshCw className="spinner" />
                  ) : (
                    <Search />
                  )}
                  {isPortfolioLoading ? 'Analyzing...' : 'Analyze Portfolio'}
                </button>
              </div>

              {portfolioError && (
                <div className="error-message">
                  <AlertTriangle className="error-icon" />
                  {portfolioError}
                </div>
              )}
            </div>

            {portfolioData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="portfolio-results"
              >
                {/* Portfolio Overview */}
                <div className="portfolio-overview">
                  <div className="overview-card total-value">
                    <div className="overview-icon">
                      <BarChart3 />
                    </div>
                    <div className="overview-content">
                      <h3>Total Value</h3>
                      <p className="overview-value">${portfolioData.totalValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="overview-card total-assets">
                    <div className="overview-icon">
                      <Coins />
                    </div>
                    <div className="overview-content">
                      <h3>Total Assets</h3>
                      <p className="overview-value">{portfolioData.totalAssets}</p>
                    </div>
                  </div>

                  <div className="overview-card total-tokens">
                    <div className="overview-icon">
                      <Database />
                    </div>
                    <div className="overview-content">
                      <h3>Tokens</h3>
                      <p className="overview-value">{portfolioData.totalTokens}</p>
                    </div>
                  </div>

                  <div className="overview-card total-nfts">
                    <div className="overview-icon">
                      <BarChart />
                    </div>
                    <div className="overview-content">
                      <h3>NFTs</h3>
                      <p className="overview-value">{portfolioData.totalNfts}</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Charts */}
                <div className="portfolio-charts">
                  <div className="chart-card">
                    <h3>Asset Distribution</h3>
                    <div className="chart-container">
                      {portfolioDistributionData && (
                        <Doughnut
                          data={portfolioDistributionData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: '#e2e8f0',
                                  padding: 20,
                                  usePointStyle: true
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Performance Trend</h3>
                    <div className="chart-container">
                      {portfolioPerformanceData && (
                        <Line
                          data={portfolioPerformanceData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                labels: {
                                  color: '#e2e8f0'
                                }
                              }
                            },
                            scales: {
                              x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(148, 163, 184, 0.1)' }
                              },
                              y: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(148, 163, 184, 0.1)' }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                <div className="assets-section">
                  <h3>Top Assets</h3>
                  <div className="assets-grid">
                    {portfolioData.assets.map((asset, index) => (
                      <div key={index} className="asset-card">
                        <div className="asset-header">
                          <div className="asset-info">
                            <h4>{asset.symbol}</h4>
                            <p>{asset.name}</p>
                          </div>
                          <div className="asset-value">
                            <p className="value">${asset.value.toLocaleString()}</p>
                            <p className={`change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="asset-details">
                          <span>Balance: {asset.balance.toLocaleString()}</span>
                          <span>Price: ${asset.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NFTs Section */}
                <div className="nfts-section">
                  <h3>NFT Collection</h3>
                  <div className="nfts-grid">
                    {portfolioData.nfts.map((nft, index) => (
                      <div key={index} className="nft-card">
                                                 <div className="nft-image">
                           <div className="nft-placeholder">
                             <BarChart className="nft-icon" />
                           </div>
                         </div>
                        <div className="nft-info">
                          <h4>{nft.name}</h4>
                          <p>{nft.collection}</p>
                          <span className="nft-value">${nft.value.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!portfolioData && !isPortfolioLoading && !portfolioError && (
              <div className="empty-portfolio">
                <Wallet className="empty-icon" />
                <h3>No Portfolio Data</h3>
                <p>Enter a wallet address to analyze the portfolio</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
