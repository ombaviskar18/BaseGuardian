# <img width="35" height="35" alt="Untitled design (4)" src="https://github.com/user-attachments/assets/4f8b03c7-01a7-4845-abf4-3feb5c08f4cc" />BaseGuardian

<div align="center">
  <video width="800" height="450" autoplay loop muted style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
    <source src="https://raw.githubusercontent.com/ombaviskar18/BaseGaurdian/main/hello/public/logos/heroivideo.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  
  **DeFi Security & Analysis Platform**
  
  *Real-time contract analysis, social sentiment tracking, and automated monitoring for DeFi investors*
  
  [![BaseChain](https://img.shields.io/badge/Built%20on-BaseChain-purple)](https://Basechain.com)
  [![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org)
  [![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
</div>

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🔍 **Contract Analysis** | Smart contract security audit, risk assessment, ABI analysis with AI insights |
| 📊 **Social Analysis** | Real-time news integration, sentiment analysis, SWOT analysis, Telegram bot alerts |
| 📈 **Tokenomics Analysis** | Market data, supply analysis, whale tracking, portfolio analysis |
| ⚡ **Real-time Monitoring** | Live token tracking, price alerts, AI predictions, interactive charts |
| 🎨 **Modern UI/UX** | Responsive design, print reports, mobile optimized, real-time updates |

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[User Interface] --> B[Contract Analysis]
        A --> C[Social Analysis]
        A --> D[Tokenomics Analysis]
        A --> E[Real-time Monitoring]
    end
    
    subgraph "Backend (Vercel Functions)"
        F[API Gateway] --> G[Contract Inspector]
        F --> H[Social Insights]
        F --> I[Token Data]
        F --> J[Health Check]
    end
    
    subgraph "External APIs"
        K[Etherscan] --> G
        L[CoinGecko] --> I
        M[Google News] --> H
        N[Gemini AI] --> H
    end
    
    subgraph "Blockchain"
        O[Ethereum] --> G
        P[Base] --> G
        Q[Polygon] --> G
        R[BSC] --> G
        S[Avalanche] --> G
    end
    
    subgraph "Smart Contracts (BaseChain)"
        T[ContractAnalysis.sol]
        U[SocialAnalysis.sol]
        V[Tokenomics.sol]
        W[Monitoring.sol]
    end
    
    B --> F
    C --> F
    D --> F
    E --> F
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Framer Motion, Chart.js |
| **Backend** | Node.js, Express.js, Vercel Functions, Axios |
| **Blockchain** | BaseChain, Solidity, Hardhat, Ethers.js |
| **APIs** | Google News, CoinGecko, Gemini AI, Telegram Bot |
| **Deployment** | Vercel, GitHub Actions |

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MetaMask wallet
- API keys (see [Setup Guide](VERCEL_ENV_SETUP.md))

### **Installation**
```bash
# Clone & install
git clone <repository-url>
cd hello
npm install
cd frontend && npm install
cd ../api && npm install

# Start development
npm run dev --prefix frontend  # Frontend
npm run server                 # Backend
```

### **Live Demo**
🌐 **[https://Base-gaurdian.vercel.app](https://Base-gaurdian.vercel.app)**

## 🌐 Deployment

### **Vercel Deployment**
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### **Environment Setup**
⚠️ **Required**: Configure environment variables in Vercel dashboard
- See [Setup Guide](VERCEL_ENV_SETUP.md) for detailed instructions
- Run `node test-api.js` to verify API functionality

### **Deployment Workflow**

```mermaid
graph LR
    A[Code Push] --> B[GitHub]
    B --> C[Vercel Build]
    C --> D[Frontend Build]
    C --> E[API Functions]
    D --> F[Static Assets]
    E --> G[Serverless Functions]
    F --> H[CDN]
    G --> I[Edge Network]
    H --> J[Live Site]
    I --> J
```

### **Smart Contracts**
```bash
npx hardhat compile
npx hardhat deploy --network Base
```

## 📱 Usage

### **User Workflow**

```mermaid
graph TD
    A[User Input] --> B{Analysis Type}
    B -->|Contract| C[Contract Analysis]
    B -->|Social| D[Social Analysis]
    B -->|Tokenomics| E[Tokenomics Analysis]
    B -->|Monitoring| F[Real-time Monitoring]
    
    C --> G[Security Score]
    D --> H[Sentiment Analysis]
    E --> I[Market Data]
    F --> J[Live Metrics]
    
    G --> K[AI Insights]
    H --> K
    I --> K
    J --> K
    
    K --> L[Download Report]
    K --> M[Share Results]
```

### **Quick Actions**
- 🔍 **Contract Analysis**: Enter address → Get security score
- 📊 **Social Analysis**: Enter symbol → View sentiment & news
- 📈 **Tokenomics**: Enter token → Analyze supply & metrics
- ⚡ **Monitoring**: Enter token → Track live data

## 🔧 Configuration

### **API Keys Required**
| Service | Setup Link | Purpose |
|---------|------------|---------|
| **Google News** | [Cloud Console](https://console.cloud.google.com) | News aggregation |
| **CoinGecko** | [CoinGecko API](https://www.coingecko.com/en/api) | Market data |
| **Gemini AI** | [AI Studio](https://makersuite.google.com/app/apikey) | AI insights |
| **Telegram Bot** | [@BotFather](https://t.me/botfather) | Automated alerts |

### **API Endpoints**
- `GET /api/health` - Health check
- `GET /api/inspect` - Contract analysis
- `GET /api/social/insights` - Social analysis
- `GET /api/token/total-supply` - Token data

## 🔒 Security & Benefits

### **Security Features**
- 🔍 Smart contract auditing & vulnerability detection
- 📊 Comprehensive risk scoring & assessment
- ⚡ Real-time monitoring & threat detection
- 🤖 AI-powered security insights
- 🌐 Multi-chain security analysis

### **Key Benefits**
| User Type | Benefits |
|-----------|----------|
| **Investors** | Risk assessment, portfolio monitoring, market insights |
| **Developers** | Contract auditing, cross-chain analysis, API access |
| **Analysts** | Comprehensive data, AI insights, report generation |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 **Documentation**: Check code comments and inline docs
- 🐛 **Issues**: Report bugs via [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: Join community discussions
- 📱 **Telegram**: [@Social_Alertbot](https://t.me/Social_Alertbot)

## 🚀 Roadmap

- [ ] Advanced AI Models & Enhanced predictions
- [ ] Additional blockchain support
- [ ] Native mobile application
- [ ] API marketplace & third-party integrations
- [ ] Enterprise-grade institutional features
- [ ] Direct DeFi protocol analysis

---

<div align="center">
  **Built with ❤️ on BaseChain**
  
  *BaseGuardian - Your DeFi Security Companion*
  
  [![GitHub stars](https://img.shields.io/github/stars/your-repo/Baseguardian?style=social)](https://github.com/your-repo/Baseguardian)
  [![GitHub forks](https://img.shields.io/github/forks/your-repo/Baseguardian?style=social)](https://github.com/your-repo/Baseguardian)
  [![GitHub issues](https://img.shields.io/github/issues/your-repo/Baseguardian)](https://github.com/your-repo/Baseguardian/issues)
</div>
