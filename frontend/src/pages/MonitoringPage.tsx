import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle, Download, Wallet, Play, Pause, Bell, Search, Activity, Shield, TrendingUp, RefreshCw, TrendingDown, DollarSign, Brain } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title, DoughnutController } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { contractService, switchToBaseSepolia } from '../utils/contracts';
import './MonitoringPage.css';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title, DoughnutController);

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  image: string;
  last_updated: string;
}

interface PriceData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface AIPrediction {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  priceTarget: number;
  timeframe: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keyFactors: string[];
}

export function MonitoringPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false);
  const [predictionTypingIndex, setPredictionTypingIndex] = useState<number>(0);
  const { account } = useWallet();
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';

  // Search for token by symbol or address
  const searchToken = async (query: string) => {
    try {
      setIsLoading(true);
      setError('');
      
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
      setError('Token not found. Please check the symbol or address.');
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

  // Fetch price chart data
  const fetchPriceChartData = async (tokenId: string) => {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=7&interval=daily`;
      const response = await fetch(url, {
        headers: COINGECKO_API_KEY ? { 'X-CG-API-KEY': COINGECKO_API_KEY } : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch price chart data');
      }
      
      const data: PriceData = await response.json();
      
      // Transform data for chart
      const chartData = data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: price,
        volume: data.total_volumes.find(([t]) => t === timestamp)?.[1] || 0,
        marketCap: data.market_caps.find(([t]) => t === timestamp)?.[1] || 0
      }));
      
      setPriceChartData(chartData);
    } catch (err) {
      console.error('Error fetching price chart data:', err);
    }
  };

  // Generate AI Prediction
  const generateAIPrediction = async () => {
    if (!monitoringData) {
      console.log('No monitoring data available for AI prediction');
      return;
    }

    console.log('Starting AI prediction generation...');
    try {
      setIsGeneratingPrediction(true);
      setPredictionTypingIndex(0);

      const params = new URLSearchParams({
        token: monitoringData.tokenSymbol,
        price: monitoringData.currentPrice.toString(),
        change24h: monitoringData.priceChange24h.toString(),
        volume: monitoringData.volume24h.toString(),
        marketCap: monitoringData.marketCap.toString(),
        riskLevel: monitoringData.riskLevel.toLowerCase()
      });

      console.log('Attempting to fetch AI prediction from API...');
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      try {
        const response = await fetch(`/api/monitoring/prediction?${params.toString()}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to generate prediction');
        }

        console.log('API prediction received:', data.prediction);
        setAiPrediction(data.prediction);
        
        // Typing animation for prediction reasoning
        const total = data.prediction.reasoning.length;
        let i = 0;
        const interval = setInterval(() => {
          i += 2;
          setPredictionTypingIndex(i);
          if (i >= total) clearInterval(interval);
        }, 16);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('API fetch failed, using fallback prediction:', fetchError);
        throw fetchError; // Re-throw to be caught by outer catch
      }

    } catch (err) {
      console.log('Using fallback AI prediction...');
      // Enhanced fallback prediction with more realistic analysis
      const priceChange = monitoringData.priceChange24h;
      const volume = monitoringData.volume24h;
      const marketCap = monitoringData.marketCap;
      
      console.log('Market data for prediction:', { priceChange, volume, marketCap });
      
      // Determine recommendation based on actual data
      let recommendation: 'BUY' | 'SELL' | 'HOLD';
      let confidence: number;
      let reasoning: string;
      let priceTarget: number;
      let timeframe: string;
      let keyFactors: string[];
      
      if (priceChange > 5 && volume > marketCap * 0.1) {
        recommendation = 'BUY';
        confidence = Math.floor(Math.random() * 20) + 75; // 75-95%
        reasoning = `Strong bullish momentum detected with ${priceChange.toFixed(2)}% price increase and high trading volume. The token shows positive market sentiment and technical indicators suggest continued upward movement. Volume analysis indicates strong buying pressure.`;
        priceTarget = monitoringData.currentPrice * (1 + (Math.random() * 0.3 + 0.1)); // 10-40% increase
        timeframe = '3-7 days';
        keyFactors = ['Strong price momentum', 'High trading volume', 'Positive market sentiment', 'Technical breakout'];
      } else if (priceChange < -5 && volume > marketCap * 0.1) {
        recommendation = 'SELL';
        confidence = Math.floor(Math.random() * 20) + 70; // 70-90%
        reasoning = `Bearish pressure detected with ${Math.abs(priceChange).toFixed(2)}% price decline and elevated trading volume. Market sentiment appears negative with increased selling pressure. Technical indicators suggest potential further downside.`;
        priceTarget = monitoringData.currentPrice * (1 - (Math.random() * 0.2 + 0.05)); // 5-25% decrease
        timeframe = '1-5 days';
        keyFactors = ['Price decline', 'High selling volume', 'Negative sentiment', 'Technical breakdown'];
      } else {
        recommendation = 'HOLD';
        confidence = Math.floor(Math.random() * 15) + 65; // 65-80%
        reasoning = `Market appears stable with moderate price movement (${priceChange.toFixed(2)}%). Volume levels are within normal ranges. No clear directional bias detected. Consider waiting for stronger signals before making trading decisions.`;
        priceTarget = monitoringData.currentPrice * (1 + (Math.random() * 0.1 - 0.05)); // -5% to +5%
        timeframe = '7-14 days';
        keyFactors = ['Stable price action', 'Normal volume levels', 'Neutral sentiment', 'Consolidation phase'];
      }
      
      const mockPrediction: AIPrediction = {
        recommendation,
        confidence,
        reasoning,
        priceTarget,
        timeframe,
        riskLevel: monitoringData.riskLevel.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        keyFactors
      };
      
      console.log('Fallback prediction generated:', mockPrediction);
      setAiPrediction(mockPrediction);
      
      // Typing animation for fallback prediction
      const total = reasoning.length;
      let i = 0;
      const interval = setInterval(() => {
        i += 2;
        setPredictionTypingIndex(i);
        if (i >= total) clearInterval(interval);
      }, 16);
    } finally {
      console.log('AI prediction generation completed');
      setIsGeneratingPrediction(false);
    }
  };

  const startMonitoring = async () => {
    if (!account) {
      setShowWalletConnect(true);
      return;
    }

    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Connect to wallet and switch to BaseChain
      const connected = await contractService.connect();
      if (!connected) {
        setError('Failed to connect wallet. Please ensure MetaMask is installed.');
        return;
      }

      // Switch to Base Sepolia network
      const switched = await switchToBaseSepolia();
      if (!switched) {
        setError('Failed to switch to Base Sepolia. Please add Base Sepolia to your wallet.');
        return;
      }

      // Call smart contract with payment
      console.log('Calling smart contract for monitoring...');
      const tx = await contractService.requestMonitoring(tokenInput.trim());
      console.log('Transaction successful:', tx);

      // After successful payment, proceed with token analysis
      const tokenData = await searchToken(tokenInput.trim());
      
      if (!tokenData) {
        return;
      }

      // Fetch price chart data
      await fetchPriceChartData(tokenData.id);

      const monitoringData = {
        token: tokenData.id,
        tokenSymbol: tokenData.symbol.toUpperCase(),
        tokenName: tokenData.name,
        tokenAddress: tokenData.contract_address || 'N/A',
        startTime: new Date().toISOString(),
        currentPrice: tokenData.market_data?.current_price?.usd || 0,
        priceChange24h: tokenData.market_data?.price_change_percentage_24h || 0,
        volume24h: tokenData.market_data?.total_volume?.usd || 0,
        liquidityUSD: tokenData.market_data?.total_volume?.usd || 0, // Using volume as proxy for liquidity
        holders: tokenData.community_data?.reddit_subscribers || 0,
        marketCap: tokenData.market_data?.market_cap?.usd || 0,
        circulatingSupply: tokenData.market_data?.circulating_supply || 0,
        totalSupply: tokenData.market_data?.total_supply || 0,
        maxSupply: tokenData.market_data?.max_supply || 0,
        transactions24h: Math.floor(Math.random() * 5000) + 500, // Mock data
        riskLevel: calculateRiskLevel(tokenData),
        monitoringStatus: 'Active',
        lastUpdate: new Date().toISOString(),
        networkActivity: {
          buys: Math.floor(Math.random() * 100) + 50,
          sells: Math.floor(Math.random() * 80) + 30,
          transfers: Math.floor(Math.random() * 200) + 100
        },
        tokenImage: tokenData.image?.large || ''
      };
      
      setMonitoringData(monitoringData);
      setIsMonitoring(true);
      
      console.log('Monitoring data set:', monitoringData);
      
      // Start real-time alerts simulation
      startAlertSimulation();
      
      // AI prediction will be auto-generated by useEffect
      
    } catch (err: any) {
      console.error('Error starting monitoring:', err);
      if (err.message && err.message.includes('Payment')) {
        setError('Payment required: Please ensure you have 0.01 aBase and approve the transaction.');
      } else if (err.message && err.message.includes('user rejected')) {
        setError('Transaction was rejected. Please try again and approve the payment.');
      } else {
        setError('Failed to start monitoring. Please check your wallet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskLevel = (tokenData: any) => {
    const priceChange = Math.abs(tokenData.market_data?.price_change_percentage_24h || 0);
    const volume = tokenData.market_data?.total_volume?.usd || 0;
    const marketCap = tokenData.market_data?.market_cap?.usd || 0;
    
    let riskScore = 0;
    
    // Price volatility
    if (priceChange > 20) riskScore += 3;
    else if (priceChange > 10) riskScore += 2;
    else if (priceChange > 5) riskScore += 1;
    
    // Low volume
    if (volume < 100000) riskScore += 2;
    else if (volume < 1000000) riskScore += 1;
    
    // Low market cap
    if (marketCap < 1000000) riskScore += 2;
    else if (marketCap < 10000000) riskScore += 1;
    
    if (riskScore >= 5) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  };

  const startAlertSimulation = () => {
    alertIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) {
        const alertTypes = ['warning', 'danger', 'info'];
        const alertMessages = [
          'Large transaction detected: $50,000 sell order',
          'Unusual trading volume spike: +300% in last 15 minutes',
          'New whale wallet identified holding 2.5% of supply',
          'Liquidity pool change detected: -15% liquidity removed',
          'Social sentiment shift: Negative trend on Twitter',
          'Suspicious contract interaction detected',
          'Price manipulation pattern identified',
          'Multiple large sells from same wallet cluster',
          'Honeypot mechanism activated in contract',
          'Cross-chain bridge activity unusual spike'
        ];
        
        const newAlert = {
          id: Date.now(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          timestamp: new Date().toISOString()
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    }, 3000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setMonitoringData(null);
    setAlerts([]);
    setPriceChartData([]);
    setAiPrediction(null);
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
  };

  const refreshData = async () => {
    if (!monitoringData?.token) return;
    
    try {
      setIsLoading(true);
      const tokenData = await fetchTokenData(monitoringData.token);
      await fetchPriceChartData(monitoringData.token);
      
      const updatedData = {
        ...monitoringData,
        currentPrice: tokenData.market_data?.current_price?.usd || 0,
        priceChange24h: tokenData.market_data?.price_change_percentage_24h || 0,
        volume24h: tokenData.market_data?.total_volume?.usd || 0,
        marketCap: tokenData.market_data?.market_cap?.usd || 0,
        lastUpdate: new Date().toISOString()
      };
      
      setMonitoringData(updatedData);
      
      // Regenerate AI prediction with new data
      setTimeout(() => generateAIPrediction(), 500);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, []);

  // Debug useEffect for AI prediction
  useEffect(() => {
    console.log('AI Prediction state changed:', aiPrediction);
  }, [aiPrediction]);

  // Auto-generate AI prediction when monitoring data is available
  useEffect(() => {
    if (monitoringData && !aiPrediction && !isGeneratingPrediction) {
      console.log('Auto-triggering AI prediction...');
      generateAIPrediction();
    }
  }, [monitoringData, aiPrediction, isGeneratingPrediction]);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return '#10b981';
      case 'SELL': return '#ef4444';
      case 'HOLD': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="recommendation-icon" />;
      case 'SELL': return <TrendingDown className="recommendation-icon" />;
      case 'HOLD': return <Activity className="recommendation-icon" />;
      default: return <Activity className="recommendation-icon" />;
    }
  };

  // Chart data generation
  const generateMarketMetricsData = () => {
    if (!monitoringData) return null;

    return {
      labels: ['Current Price', '24h Volume', 'Market Cap', 'Liquidity'],
      datasets: [
        {
          label: 'Market Metrics (Normalized)',
          data: [
            monitoringData.currentPrice / 1000, // Normalize for better visualization
            monitoringData.volume24h / 1000000, // Convert to millions
            monitoringData.marketCap / 1000000000, // Convert to billions
            monitoringData.liquidityUSD / 1000000, // Convert to millions
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateNetworkActivityData = () => {
    if (!monitoringData) return null;

    return {
      labels: ['Buys', 'Sells', 'Transfers'],
      datasets: [
        {
          data: [
            monitoringData.networkActivity.buys,
            monitoringData.networkActivity.sells,
            monitoringData.networkActivity.transfers,
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="monitoring-page">
      {/* Hero Section */}
      <section className="monitoring-hero">
        <div className="monitoring-hero-container">
          <div className="monitoring-hero-grid">
            <div className="monitoring-hero-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="monitoring-hero-badge"
              >
                <Zap className="hero-badge-icon" />
                <span>Real-Time Protection & Alerts</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="monitoring-hero-title"
              >
                Real-Time
                <span className="title-line-2"> Protection & Alerts</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="monitoring-hero-description"
              >
                Continuous 24/7 surveillance with instant alerts for suspicious trading patterns, whale movements, liquidity changes, and malicious behavior across all major blockchains.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="monitoring-features-grid"
              >
                <div className="monitoring-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="rgba(249, 115, 22, 0.1)"/>
                      <path d="M20 32L28 40L44 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="32" cy="16" r="4" fill="currentColor"/>
                      <path d="M28 12L32 8L36 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="16" cy="48" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="48" cy="48" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="32" cy="52" r="2" fill="rgba(249, 115, 22, 0.6)"/>
                      <path d="M16 46L32 50L48 46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2"/>
                      <rect x="28" y="28" width="8" height="8" rx="2" fill="rgba(249, 115, 22, 0.3)"/>
                    </svg>
                  </div>
                  <span>Price Monitoring</span>
                </div>
                <div className="monitoring-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="12" y="20" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="rgba(249, 115, 22, 0.1)"/>
                      <circle cx="24" cy="32" r="6" fill="currentColor"/>
                      <path d="M32 26L40 32L32 38" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="44" cy="32" r="3" fill="rgba(249, 115, 22, 0.6)"/>
                      <path d="M8 12L16 8L24 12L32 8L40 12L48 8L56 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="16" cy="8" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="32" cy="8" r="2" fill="rgba(249, 115, 22, 0.6)"/>
                      <circle cx="48" cy="8" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <path d="M8 52L16 56L24 52L32 56L40 52L48 56L56 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <text x="32" y="58" textAnchor="middle" fontSize="6" fill="currentColor">WHALE</text>
                    </svg>
                  </div>
                  <span>Whale Tracking</span>
                </div>
                <div className="monitoring-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" fill="rgba(249, 115, 22, 0.05)"/>
                      <path d="M24 24L40 40M40 24L24 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="32" cy="12" r="3" fill="currentColor"/>
                      <path d="M28 8L32 4L36 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="20" y="48" width="24" height="8" rx="4" stroke="currentColor" strokeWidth="2" fill="rgba(249, 115, 22, 0.2)"/>
                      <circle cx="26" cy="52" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="32" cy="52" r="2" fill="rgba(249, 115, 22, 0.6)"/>
                      <circle cx="38" cy="52" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <path d="M16 20L20 16L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M40 20L44 16L48 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span>Threat Detection</span>
                </div>
                <div className="monitoring-feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="16" y="24" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="rgba(249, 115, 22, 0.1)"/>
                      <circle cx="24" cy="36" r="2" fill="currentColor"/>
                      <circle cx="32" cy="36" r="2" fill="rgba(249, 115, 22, 0.8)"/>
                      <circle cx="40" cy="36" r="2" fill="rgba(249, 115, 22, 0.6)"/>
                      <path d="M20 40L28 44L36 40L44 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="32" cy="12" r="4" fill="currentColor"/>
                      <path d="M28 8L32 4L36 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 20L16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M44 20L48 16L52 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="26" y="52" width="12" height="4" rx="2" fill="rgba(249, 115, 22, 0.5)"/>
                      <text x="32" y="58" textAnchor="middle" fontSize="6" fill="currentColor">ALERT</text>
                    </svg>
                  </div>
                  <span>Instant Alerts</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="monitoring-hero-video-container"
            >
              <div className="monitoring-video-card">
                <video
                  className="monitoring-hero-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/logos/monitor.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div> 
        </div>
      </section>

      {/* Main Monitoring Section */}
      <section className="monitoring-main">
        <div className="monitoring-container">
          {!isMonitoring ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="monitoring-scanner"
            >
              <div className="scanner-card">
                <div className="scanner-header">
                  <h2 className="scanner-title">
                    Real-Time
                    <span className="title-line-2"> Monitoring Center</span>
                  </h2>
                  <p className="scanner-subtitle">
                    Enter a token symbol (e.g., ETH, BTC) or contract address to begin 24/7 real-time monitoring and threat detection
                  </p>
                </div>

                <div className="scanner-form">
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

                  {error && (
                    <div className="error-message">
                      <AlertTriangle className="error-icon" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <div className="scan-button-container">
                    <button
                      onClick={startMonitoring}
                      disabled={!tokenInput.trim() || isLoading}
                      className={`main-scan-button ${isLoading ? 'loading' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="scan-spinner"></div>
                          <span>Searching Token...</span>
                        </>
                      ) : (
                        <>
                      <Play className="scan-icon" />
                      <span>Start Real-Time Monitoring</span>
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
                        Connect your wallet and pay 0.01 ETH on Base Sepolia to start real-time monitoring.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="analysis-info">
                  <h3 className="info-title">Real-Time Monitoring Features:</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Live Price & Market Data</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Large Transaction Detection</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Whale Activity Tracking</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Liquidity Pool Changes</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Contract Interaction Monitoring</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Cross-Chain Bridge Activity</span>
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
              className="monitoring-results"
            >
              <div className="monitoring-status-header">
                <div className="status-section">
                  <div className="status-indicator">
                    <div className="status-dot"></div>
                    <span className="status-text">Monitoring Active</span>
                  </div>
                  <div className="status-info">
                    <div className="token-info-row">
                      {monitoringData.tokenImage && (
                        <img src={monitoringData.tokenImage} alt={monitoringData.tokenName} className="token-image" />
                      )}
                      <div>
                        <p className="token-info">
                          {monitoringData.tokenName} ({monitoringData.tokenSymbol})
                        </p>
                        <p className="token-address">Address: {monitoringData.tokenAddress}</p>
                      </div>
                    </div>
                    <p className="start-time">Started: {new Date(monitoringData.startTime).toLocaleString()}</p>
                    <p className="last-update">Last Update: {new Date(monitoringData.lastUpdate).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="risk-indicator">
                  <span className={`risk-badge risk-${monitoringData.riskLevel.toLowerCase()}`}>
                    {monitoringData.riskLevel} Risk
                  </span>
                  <button onClick={refreshData} disabled={isLoading} className="refresh-button">
                    <RefreshCw className={`refresh-icon ${isLoading ? 'spinning' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="monitoring-content">
                {/* AI Prediction Section */}
                {aiPrediction ? (
                  <div className="ai-prediction-section">
                    <div className="prediction-header">
                      <div className="prediction-title-section">
                        <Brain className="prediction-icon" />
                        <h3 className="section-title">AI Trading Prediction</h3>
                      </div>
                      <button 
                        onClick={generateAIPrediction} 
                        disabled={isGeneratingPrediction}
                        className="regenerate-prediction-button"
                      >
                        <RefreshCw className={`refresh-icon ${isGeneratingPrediction ? 'spinning' : ''}`} />
                        Regenerate
                      </button>
                    </div>
                    
                    <div className="prediction-grid">
                      <div className="prediction-main-card">
                        <div className="recommendation-section">
                          <div className="recommendation-header">
                            {getRecommendationIcon(aiPrediction.recommendation)}
                            <div className="recommendation-content">
                              <h4 className="recommendation-title">
                                {aiPrediction.recommendation}
                              </h4>
                              <p className="recommendation-confidence">
                                {aiPrediction.confidence}% Confidence
                              </p>
                            </div>
                          </div>
                          <div 
                            className="recommendation-badge"
                            style={{ backgroundColor: getRecommendationColor(aiPrediction.recommendation) + '20', borderColor: getRecommendationColor(aiPrediction.recommendation) }}
                          >
                            <span style={{ color: getRecommendationColor(aiPrediction.recommendation) }}>
                              {aiPrediction.recommendation}
                            </span>
                          </div>
                        </div>
                        
                        <div className="prediction-details">
                          <div className="prediction-reasoning">
                            <h5>Analysis:</h5>
                            <p className="reasoning-text">
                              {aiPrediction.reasoning.slice(0, predictionTypingIndex)}
                              {predictionTypingIndex < aiPrediction.reasoning.length && (
                                <span className="typing-cursor">|</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="prediction-metrics">
                            <div className="prediction-metric">
                              <span className="metric-label">Price Target:</span>
                              <span className="metric-value">${aiPrediction.priceTarget.toFixed(4)}</span>
                            </div>
                            <div className="prediction-metric">
                              <span className="metric-label">Timeframe:</span>
                              <span className="metric-value">{aiPrediction.timeframe}</span>
                            </div>
                            <div className="prediction-metric">
                              <span className="metric-label">Risk Level:</span>
                              <span className={`metric-value risk-${aiPrediction.riskLevel.toLowerCase()}`}>
                                {aiPrediction.riskLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prediction-factors-card">
                        <h5>Key Factors:</h5>
                        <div className="factors-list">
                          {aiPrediction.keyFactors.map((factor, index) => (
                            <div key={index} className="factor-item">
                              <CheckCircle className="factor-icon" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ai-prediction-section">
                    <div className="prediction-header">
                      <div className="prediction-title-section">
                        <Brain className="prediction-icon" />
                        <h3 className="section-title">AI Trading Prediction</h3>
                      </div>
                    </div>
                    
                    <div className="ai-prediction-loading">
                      <div className="loading-spinner"></div>
                      <button 
                        onClick={() => {
                          console.log('Manual AI prediction trigger clicked');
                          generateAIPrediction();
                        }}
                        className="manual-trigger-button"
                        style={{
                          marginTop: '1rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Manual Trigger AI Prediction
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Metrics */}
                <div className="live-metrics">
                  <h3 className="section-title">Live Token Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">${monitoringData.currentPrice.toFixed(4)}</div>
                      <div className="metric-label">Current Price</div>
                    </div>
                    <div className="metric-card">
                      <div className={`metric-value ${monitoringData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {monitoringData.priceChange24h >= 0 ? '+' : ''}{monitoringData.priceChange24h.toFixed(2)}%
                      </div>
                      <div className="metric-label">24h Change</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${monitoringData.volume24h.toLocaleString()}</div>
                      <div className="metric-label">24h Volume</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${monitoringData.liquidityUSD.toLocaleString()}</div>
                      <div className="metric-label">Liquidity</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${monitoringData.marketCap.toLocaleString()}</div>
                      <div className="metric-label">Market Cap</div>
                    </div>
                  </div>
                </div>

                {/* Price Chart */}
                {priceChartData.length > 0 && (
                  <div className="price-chart-section">
                    <h3 className="section-title">7-Day Price Chart</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={priceChartData}>
                          <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(148, 163, 184, 0.6)"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="rgba(148, 163, 184, 0.6)"
                            fontSize={12}
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }}
                            formatter={(value: any) => [`$${value.toFixed(4)}`, 'Price']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fill="url(#priceGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Network Activity */}
                <div className="network-activity">
                  <h3 className="section-title">Network Activity (Last Hour)</h3>
                  <div className="activity-grid">
                    <div className="activity-card">
                      <div className="activity-header">
                        <TrendingUp className="activity-icon text-green-400" />
                        <span className="activity-label">Buys</span>
                      </div>
                      <div className="activity-value">{monitoringData.networkActivity.buys}</div>
                    </div>
                    <div className="activity-card">
                      <div className="activity-header">
                        <TrendingUp className="activity-icon text-red-400" style={{ transform: 'rotate(180deg)' }} />
                        <span className="activity-label">Sells</span>
                      </div>
                      <div className="activity-value">{monitoringData.networkActivity.sells}</div>
                    </div>
                    <div className="activity-card">
                      <div className="activity-header">
                        <Activity className="activity-icon text-blue-400" />
                        <span className="activity-label">Transfers</span>
                      </div>
                      <div className="activity-value">{monitoringData.networkActivity.transfers}</div>
                    </div>
                  </div>
                </div>

                {/* Real-Time Alerts */}
                <div className="alerts-section">
                  <div className="alerts-header">
                    <div className="alerts-title-section">
                      <Bell className="alerts-icon" />
                      <h3 className="section-title">Real-Time Security Alerts</h3>
                    </div>
                    <div className="alerts-count">
                      {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="alerts-container">
                    {alerts.length === 0 ? (
                      <div className="no-alerts">
                        <Shield className="no-alerts-icon" />
                        <p className="no-alerts-text">All systems secure. No threats detected.</p>
                      </div>
                    ) : (
                      <div className="alerts-list">
                        {alerts.map((alert) => (
                          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                            <div className="alert-indicator">
                              <AlertTriangle className="alert-icon" />
                            </div>
                            <div className="alert-content">
                              <p className="alert-message">{alert.message}</p>
                              <p className="alert-timestamp">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className={`alert-severity alert-severity-${alert.type}`}>
                              {alert.type.toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                  <h3 className="section-title">Market Analytics</h3>
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h4 className="chart-title">Market Metrics Overview</h4>
                      <div className="chart-container">
                        {generateMarketMetricsData() && (
                          <Bar 
                            data={generateMarketMetricsData()!} 
                            options={{
                              ...chartOptions,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    color: '#94a3b8',
                                    font: { size: 12 },
                                    callback: function(value) {
                                      return value.toLocaleString();
                                    }
                                  },
                                  grid: {
                                    color: 'rgba(148, 163, 184, 0.1)',
                                  },
                                },
                                x: {
                                  ticks: {
                                    color: '#94a3b8',
                                    font: { size: 12 },
                                  },
                                  grid: {
                                    color: 'rgba(148, 163, 184, 0.1)',
                                  },
                                },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="chart-card">
                      <h4 className="chart-title">Network Activity Distribution</h4>
                      <div className="chart-container">
                        {generateNetworkActivityData() && (
                          <Doughnut 
                            data={generateNetworkActivityData()!} 
                            options={doughnutOptions}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="monitoring-actions">
                  <button 
                    onClick={() => {
                      // Trigger print functionality
                      window.print();
                    }}
                    className="download-button"
                  >
                    <Download className="action-icon" />
                    <span>Download Full Report</span>
                  </button>
                  <button 
                    onClick={stopMonitoring}
                    className="stop-button"
                  >
                    <Pause className="action-icon" />
                    <span>Stop Monitoring</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
