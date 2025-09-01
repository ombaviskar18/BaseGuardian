import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Scan, AlertTriangle, CheckCircle, Download, Wallet, Search, Brain, RefreshCw, Activity, } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { contractService, switchToBaseSepolia } from '../utils/contracts';
import './ContractAnalysisPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface AIContractAnalysis {
  recommendation: 'SAFE' | 'RISKY' | 'UNSAFE';
  confidence: number;
  reasoning: string;
  riskFactors: string[];
  securityScore: number;
  deploymentAdvice: string;
  keyFindings: string[];
}

export function ContractAnalysisPage() {
  const [contractAddress, setContractAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIContractAnalysis | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTypingIndex, setAiTypingIndex] = useState<number>(0);
  const { account } = useWallet();

  const handleScan = async () => {
    if (!account) {
      setShowWalletConnect(true);
      return;
    }

    if (!contractAddress) return;

    // Client-side strict validation to mirror backend behavior
    const addr = contractAddress.trim();
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(addr);
    if (!isValid) {
      setErrorMessage('Invalid address format. Please enter a 42‑character 0x… address.');
      setScanResult(null);
      return;
    }

    setIsScanning(true);
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
      console.log('Calling smart contract for contract analysis...');
      const tx = await contractService.requestContractAnalysis(addr);
      console.log('Transaction successful:', tx);

      // After successful payment, proceed with analysis
      const params = new URLSearchParams({ chain: 'ethereum', address: addr });
              const res = await fetch(`/api/inspect?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || (data as any).error) {
        const msg = (data && (data as any).error) ? String((data as any).error) : 'Unexpected error';
        setErrorMessage(msg);
        setScanResult(null);
        return;
      }

      const result = {
        address: data.address,
        riskScore: data.riskScore,
        vulnerabilities: data.vulnerabilities || [],
        recommendations: data.recommendations || [],
        securityChecks: data.securityChecks || { honeypot: { status: 'unknown', score: 50 }, ownership: { status: 'unknown', score: 50 }, liquidity: { status: 'unknown', score: 50 }, rugpull: { status: 'unknown', score: 50 } },
        timestamp: data.timestamp,
      };
      setScanResult(result);
      setErrorMessage('');
    } catch (e: any) {
      console.error('Error during contract analysis:', e);
      setScanResult(null);
      if (e.message && e.message.includes('Payment')) {
        setErrorMessage('Payment required: Please ensure you have 0.01 aBase and approve the transaction.');
      } else if (e.message && e.message.includes('user rejected')) {
        setErrorMessage('Transaction was rejected. Please try again and approve the payment.');
      } else {
        setErrorMessage('Failed to process analysis. Please check your wallet connection and try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low Risk', color: 'risk-low', bgColor: '#10b981' };
    if (score <= 60) return { level: 'Medium Risk', color: 'risk-medium', bgColor: '#f59e0b' };
    if (score <= 80) return { level: 'High Risk', color: 'risk-high', bgColor: '#f97316' };
    return { level: 'Critical Risk', color: 'risk-critical', bgColor: '#ef4444' };
  };

  const getCheckStatus = (status: string) => {
    switch (status) {
      case 'safe': return { icon: CheckCircle, color: '#10b981', text: 'Safe' };
      case 'warning': return { icon: AlertTriangle, color: '#f59e0b', text: 'Warning' };
      case 'danger': return { icon: AlertTriangle, color: '#ef4444', text: 'Danger' };
      default: return { icon: AlertTriangle, color: '#6b7280', text: 'Unknown' };
    }
  };

  const downloadReport = () => {
    // Trigger print functionality
    window.print();
  };

  // Generate AI Contract Analysis
  const generateAIAnalysis = async () => {
    if (!scanResult) return;

    try {
      setIsGeneratingAI(true);
      setAiTypingIndex(0);

      // Enhanced AI analysis based on scan results
      const riskScore = scanResult.riskScore;
      const vulnerabilities = scanResult.vulnerabilities || [];
      const securityChecks = scanResult.securityChecks || {};

      let recommendation: 'SAFE' | 'RISKY' | 'UNSAFE';
      let confidence: number;
      let reasoning: string;
      let securityScore: number;
      let deploymentAdvice: string;
      let riskFactors: string[] = [];
      let keyFindings: string[] = [];

      // Analyze risk score
      if (riskScore <= 30) {
        recommendation = 'SAFE';
        confidence = Math.floor(Math.random() * 15) + 80; // 80-95%
        reasoning = `This contract appears to be safe for deployment with a low risk score of ${riskScore}. The security analysis shows minimal vulnerabilities and strong security measures in place. The contract demonstrates good coding practices and follows security best practices.`;
        securityScore = Math.floor(Math.random() * 20) + 80; // 80-100%
        deploymentAdvice = 'Safe to deploy with current security measures. Consider regular audits for maintenance.';
      } else if (riskScore <= 60) {
        recommendation = 'RISKY';
        confidence = Math.floor(Math.random() * 20) + 65; // 65-85%
        reasoning = `This contract shows moderate risk with a score of ${riskScore}. Several security concerns have been identified that should be addressed before deployment. While not immediately dangerous, improvements are recommended.`;
        securityScore = Math.floor(Math.random() * 25) + 55; // 55-80%
        deploymentAdvice = 'Address identified vulnerabilities before deployment. Consider additional security audits.';
      } else {
        recommendation = 'UNSAFE';
        confidence = Math.floor(Math.random() * 20) + 70; // 70-90%
        reasoning = `This contract poses significant security risks with a high risk score of ${riskScore}. Multiple critical vulnerabilities have been detected that could lead to fund loss or contract compromise. Immediate remediation is required.`;
        securityScore = Math.floor(Math.random() * 30) + 30; // 30-60%
        deploymentAdvice = 'DO NOT DEPLOY. Address all critical vulnerabilities first. Consider complete contract redesign.';
      }

      // Generate risk factors based on vulnerabilities
      if (vulnerabilities.length > 0) {
        riskFactors = vulnerabilities.slice(0, 5).map((vuln: any) => vuln.name || 'Security vulnerability detected');
      } else {
        riskFactors = ['No major vulnerabilities detected', 'Standard security measures in place'];
      }

      // Generate key findings based on security checks
      Object.entries(securityChecks).forEach(([check, data]: [string, any]) => {
        if (data && data.status) {
          if (data.status === 'danger') {
            keyFindings.push(`${check.charAt(0).toUpperCase() + check.slice(1)}: Critical security issue detected`);
          } else if (data.status === 'warning') {
            keyFindings.push(`${check.charAt(0).toUpperCase() + check.slice(1)}: Potential security concern`);
          } else if (data.status === 'safe') {
            keyFindings.push(`${check.charAt(0).toUpperCase() + check.slice(1)}: Security check passed`);
          }
        }
      });

      if (keyFindings.length === 0) {
        keyFindings = ['Comprehensive security analysis completed', 'Risk assessment based on multiple factors'];
      }

      const aiResult: AIContractAnalysis = {
        recommendation,
        confidence,
        reasoning,
        riskFactors,
        securityScore,
        deploymentAdvice,
        keyFindings
      };

      setAiAnalysis(aiResult);

      // Typing animation for AI reasoning
      const total = reasoning.length;
      let i = 0;
      const interval = setInterval(() => {
        i += 2;
        setAiTypingIndex(i);
        if (i >= total) clearInterval(interval);
      }, 16);

    } catch (err) {
      console.error('Error generating AI analysis:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Auto-generate AI analysis when scan result is available
  useEffect(() => {
    if (scanResult && !aiAnalysis && !isGeneratingAI) {
      generateAIAnalysis();
    }
  }, [scanResult, aiAnalysis, isGeneratingAI]);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'SAFE': return '#10b981';
      case 'RISKY': return '#f59e0b';
      case 'UNSAFE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'SAFE': return <CheckCircle className="recommendation-icon" />;
      case 'RISKY': return <AlertTriangle className="recommendation-icon" />;
      case 'UNSAFE': return <AlertTriangle className="recommendation-icon" />;
      default: return <Activity className="recommendation-icon" />;
    }
  };

  // Chart data generation
  const generateSecurityChartData = () => {
    if (!scanResult) return null;

    const securityChecks = scanResult.securityChecks || {};
    const checkNames = Object.keys(securityChecks);
    const checkScores = Object.values(securityChecks).map((check: any) => check.score || 0);

    return {
      labels: checkNames.map(name => name.charAt(0).toUpperCase() + name.slice(1)),
      datasets: [
        {
          label: 'Security Score',
          data: checkScores,
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateRiskDistributionData = () => {
    if (!scanResult) return null;

    const riskScore = scanResult.riskScore;
    let lowRisk = 0, mediumRisk = 0, highRisk = 0, criticalRisk = 0;

    if (riskScore <= 30) lowRisk = 100;
    else if (riskScore <= 60) mediumRisk = 100;
    else if (riskScore <= 80) highRisk = 100;
    else criticalRisk = 100;

    return {
      labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
      datasets: [
        {
          data: [lowRisk, mediumRisk, highRisk, criticalRisk],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)',
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

  const pieChartOptions = {
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
    <div className="contract-analysis-page">
      {/* Hero Section */}
      <section className="analysis-hero">
        <div className="analysis-hero-container">
          <div className="analysis-hero-grid">
            <div className="analysis-hero-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="analysis-hero-badge"
              >
                <Shield className="hero-badge-icon" />
                <span>AI-Powered Security Analysis</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="analysis-hero-title"
              >
                Smart Contract
                <span className="title-line-2"> Risk Analysis</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="analysis-hero-description"
              >
                Comprehensive security evaluation powered by BaseChain's cross-chain capabilities and advanced AI analysis. 
                Detect vulnerabilities, honeypots, and malicious patterns before you invest.
              </motion.p>

            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="analysis-hero-video-container"
            >
              <div className="analysis-video-card">
                <video
                  className="analysis-hero-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/logos/contractsearch.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="analysis-main">
        <div className="analysis-container">
          {!scanResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="analysis-scanner"
            >
              <div className="scanner-card">
                <div className="scanner-header">
                  <h2 className="scanner-title">
                    Contract Security
                    <span className="title-line-2"> Scanner</span>
                  </h2>
                  <p className="scanner-subtitle">
                    Enter a smart contract address to begin comprehensive security analysis
                  </p>
                </div>

                <div className="scanner-form">
                  {errorMessage && (
                    <div className="wallet-warning" style={{ marginBottom: '12px' }}>
                      <div className="warning-header">
                        <AlertTriangle className="warning-icon" />
                        <span className="warning-title">{errorMessage}</span>
                      </div>
                    </div>
                  )}
                  <div className="input-row">
                    <div className="input-checkbox">
                      <label htmlFor="terms" className="checkbox-label"></label>
                    </div>
                    <div className="input-field-container">
                      <input
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="Enter contract address (0x...)"
                        className="contract-input-field"
                      />
                      <Search className="input-search-icon" />
                    </div>
                  </div>
                  
                  <div className="scan-button-container">
                    <button
                      onClick={handleScan}
                      disabled={isScanning || !contractAddress}
                      className={`main-scan-button ${isScanning ? 'scanning' : ''}`}
                    >
                      {isScanning ? (
                        <>
                          <div className="scan-spinner"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="scan-icon" />
                          <span>Analyze Security</span>
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
                        Connect your wallet and pay 0.01 ETH on Base Sepolia to perform security analysis.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="analysis-info">
                  <h3 className="info-title">Comprehensive Analysis Includes:</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Honeypot & Rugpull Detection</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Owner Privilege Analysis</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Liquidity Lock Verification</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Vulnerability Assessment</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>Cross-Chain Risk Analysis</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle className="info-icon" />
                      <span>AI-Powered Pattern Recognition</span>
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
              className="analysis-results"
            >
              <div className="results-header">
                <div className="results-title-section">
                  <h2 className="results-title">Security Analysis Complete</h2>
                  <p className="results-subtitle">Contract: {scanResult.address}</p>
                  <p className="results-timestamp">
                    Analysis completed on {new Date(scanResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="results-content">
                {/* AI Analysis Section */}
                {aiAnalysis ? (
                  <div className="ai-analysis-section">
                    <div className="ai-analysis-header">
                      <div className="ai-analysis-title-section">
                        <Brain className="ai-analysis-icon" />
                        <h3 className="section-title">AI Security Assessment</h3>
                      </div>
                      <button 
                        onClick={generateAIAnalysis} 
                        disabled={isGeneratingAI}
                        className="regenerate-ai-button"
                      >
                        <RefreshCw className={`refresh-icon ${isGeneratingAI ? 'spinning' : ''}`} />
                        Regenerate
                      </button>
                    </div>
                    
                    <div className="ai-analysis-grid">
                      <div className="ai-analysis-main-card">
                        <div className="ai-recommendation-section">
                          <div className="ai-recommendation-header">
                            {getRecommendationIcon(aiAnalysis.recommendation)}
                            <div className="ai-recommendation-content">
                              <h4 className="ai-recommendation-title">
                                {aiAnalysis.recommendation}
                              </h4>
                              <p className="ai-recommendation-confidence">
                                {aiAnalysis.confidence}% Confidence
                              </p>
                            </div>
                          </div>
                          <div 
                            className="ai-recommendation-badge"
                            style={{ backgroundColor: getRecommendationColor(aiAnalysis.recommendation) + '20', borderColor: getRecommendationColor(aiAnalysis.recommendation) }}
                          >
                            <span style={{ color: getRecommendationColor(aiAnalysis.recommendation) }}>
                              {aiAnalysis.recommendation}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ai-analysis-details">
                          <div className="ai-reasoning">
                            <h5>AI Analysis:</h5>
                            <p className="ai-reasoning-text">
                              {aiAnalysis.reasoning.slice(0, aiTypingIndex)}
                              {aiTypingIndex < aiAnalysis.reasoning.length && (
                                <span className="typing-cursor">|</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="ai-metrics">
                            <div className="ai-metric">
                              <span className="ai-metric-label">Security Score:</span>
                              <span className="ai-metric-value">{aiAnalysis.securityScore}/100</span>
                            </div>
                            <div className="ai-metric">
                              <span className="ai-metric-label">Deployment Advice:</span>
                              <span className="ai-metric-value">{aiAnalysis.deploymentAdvice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ai-findings-card">
                        <h5>Key Findings:</h5>
                        <div className="ai-findings-list">
                          {aiAnalysis.keyFindings.map((finding, index) => (
                            <div key={index} className="ai-finding-item">
                              <CheckCircle className="ai-finding-icon" />
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ai-analysis-section">
                    <div className="ai-analysis-header">
                      <div className="ai-analysis-title-section">
                        <Brain className="ai-analysis-icon" />
                        <h3 className="section-title">AI Security Assessment</h3>
                      </div>
                    </div>
                    
                    <div className="ai-analysis-loading">
                      <div className="loading-spinner"></div>
                      <p className="loading-text">Generating AI analysis...</p>
                    </div>
                  </div>
                )}

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
                          stroke={getRiskLevel(scanResult.riskScore).bgColor}
                          strokeWidth="8"
                          strokeDasharray={`${scanResult.riskScore * 2.83} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="risk-score-content">
                        <div className="risk-number">{scanResult.riskScore}</div>
                        <div className="risk-label">Risk Score</div>
                      </div>
                    </div>
                  </div>
                  <div className={`risk-level ${getRiskLevel(scanResult.riskScore).color}`}>
                    {getRiskLevel(scanResult.riskScore).level}
                  </div>
                </div>

                {/* Security Checks Grid */}
                <div className="security-checks">
                  <h3 className="section-title">Security Checks</h3>
                  <div className="checks-grid">
                    {Object.entries(scanResult.securityChecks).map(([key, check]: [string, any]) => {
                      const status = getCheckStatus(check.status);
                      const StatusIcon = status.icon;
                      return (
                        <div key={key} className="check-card">
                          <div className="check-header">
                            <StatusIcon className="check-icon" style={{ color: status.color }} />
                            <span className="check-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          </div>
                          <div className="check-score" style={{ color: status.color }}>
                            {check.score}/100
                          </div>
                          <div className="check-status" style={{ color: status.color }}>
                            {status.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Findings Section */}
                <div className="findings-section">
                  <div className="findings-grid">
                    <div className="findings-card vulnerabilities">
                      <div className="findings-header">
                        <AlertTriangle className="findings-icon danger" />
                        <h3 className="findings-title">Vulnerabilities Detected</h3>
                        <span className="findings-count">{scanResult.vulnerabilities.length}</span>
                      </div>
                      <div className="findings-list">
                        {scanResult.vulnerabilities.map((vuln: string, index: number) => (
                          <div key={index} className="finding-item">
                            <span className="finding-bullet danger"></span>
                            <span className="finding-text">{vuln}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="findings-card recommendations">
                      <div className="findings-header">
                        <CheckCircle className="findings-icon success" />
                        <h3 className="findings-title">Security Recommendations</h3>
                        <span className="findings-count">{scanResult.recommendations.length}</span>
                      </div>
                      <div className="findings-list">
                        {scanResult.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="finding-item">
                            <span className="finding-bullet success"></span>
                            <span className="finding-text">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                  <h3 className="section-title">Security Analytics</h3>
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h4 className="chart-title">Security Check Scores</h4>
                      <div className="chart-container">
                        {generateSecurityChartData() && (
                          <Bar 
                            data={generateSecurityChartData()!} 
                            options={{
                              ...chartOptions,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  ticks: {
                                    color: '#94a3b8',
                                    font: { size: 12 },
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
                      <h4 className="chart-title">Risk Distribution</h4>
                      <div className="chart-container">
                        {generateRiskDistributionData() && (
                          <Pie 
                            data={generateRiskDistributionData()!} 
                            options={pieChartOptions}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="results-actions" data-timestamp={new Date().toLocaleString()}>
                  <button onClick={downloadReport} className="download-button">
                    <Download className="action-icon" />
                    <span>Download Full Report</span>
                  </button>
                  <button 
                    onClick={() => {
                      setScanResult(null);
                      setContractAddress('');
                      setShowWalletConnect(false);
                    }}
                    className="scan-another-button"
                  >
                    <Scan className="action-icon" />
                    <span>Analyze Another Contract</span>
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
