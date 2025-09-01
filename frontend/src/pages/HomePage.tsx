import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Scan, 
  BarChart3, 
  Eye, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Play,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [] = useInView({ threshold: 0.3, triggerOnce: true });
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.2, triggerOnce: true });

  const features = [
    {
      icon: Shield,
      title: 'Smart Contract Analysis',
      description: 'AI-powered vulnerability detection to identify hidden backdoors, honeypot functions, and security risks.',
      gradient: 'from-blue-500 to-blue-600',
      path: '/contract-analysis'
    },
    {
      icon: BarChart3,
      title: 'Tokenomics Evaluation',
      description: 'Deep analysis of token distribution, whale concentration, and economic manipulation indicators.',
      gradient: 'from-green-500 to-green-600',
      path: '/tokenomics'
    },
    {
      icon: Eye,
      title: 'Social Forensics',
      description: 'Sentiment analysis to detect pump-and-dump schemes and fake community engagement.',
      gradient: 'from-purple-500 to-purple-600',
      path: '/social-analysis'
    },
    {
      icon: Zap,
      title: 'Real-Time Monitoring',
      description: 'Continuous surveillance with instant alerts for suspicious behavior and trading patterns.',
      gradient: 'from-orange-500 to-red-500',
      path: '/monitoring'
    }
  ];



  const workflowSteps = [
    {
      step: '01',
      title: 'Contract Input',
      description: 'User enters contract address or token symbol',
      icon: Scan,
      color: 'blue'
    },
    {
      step: '02',
      title: 'Multi-Agent Analysis',
      description: 'AI agents analyze contract, tokenomics, and social signals',
      icon: Bot,
      color: 'green'
    },
    {
      step: '03',
      title: 'Risk Calculation',
      description: 'Weighted scoring algorithm generates comprehensive risk assessment',
      icon: BarChart3,
      color: 'purple'
    },
    {
      step: '04',
      title: 'Results Dashboard',
      description: 'Interactive dashboard with detailed analysis and recommendations',
      icon: CheckCircle,
      color: 'orange'
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        {/* Animated Background Elements */}
        <div className="hero-bg-elements">
          <div className="bg-dot bg-dot-1" />
          <div className="bg-dot bg-dot-2" />
          <div className="bg-dot bg-dot-3" />
          <div className="bg-dot bg-dot-4" />
        </div>

        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hero-badge"
              >
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="text-gray-200">Decentralized Security Agent</span>
                <div className="pulse-dot" />
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hero-title"
              >
                <h1>
                  <span className="title-line-1">Protect Your</span>
                  <span className="title-line-2">DeFi Investments</span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="hero-description"
              >
                AI-powered guardian that detects rug pulls, analyzes smart contracts, and evaluates tokenomics{' '}
                <span className="text-cyan-400 font-semibold">before you invest</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="hero-cta"
              >
                <Link to="/contract-analysis" className="btn-primary">
                  <Scan className="h-5 w-5" />
                  <span>Start Security Scan</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link to="/send-message" className="btn-secondary">
                  <div className="play-icon">
                    <Play className="h-5 w-5" />
                  </div>
                  <span>Send Message</span>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="trust-indicators"
              >
              </motion.div>
            </motion.div>

            {/* Right Column - Video Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hero-video-container"
            >
              <div className="video-card">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="hero-video"
                >
                  <source src="/logos/herovideo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="floating-element floating-1"
          >
            <Shield className="h-12 w-12" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="floating-element floating-2"
          >
            <Scan className="h-10 w-10" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="floating-element floating-3"
          >
            <BarChart3 className="h-8 w-8" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section">
        <div className="features-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="features-header"
          >
            <h2 className="features-title">
              Advanced Security Features
            </h2>
            <p className="features-subtitle">
              Multi-layered protection combining AI analysis, blockchain forensics, and social intelligence
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="feature-card"
                onClick={() => navigate(feature.path)}
              >
                <div className={`feature-icon bg-gradient-to-r ${feature.gradient}`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-cta">
                  <span>Start Now</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="workflow-section">
        <div className="workflow-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="workflow-header"
          >
            <h2 className="workflow-title">
              How BaseGuardian Works
            </h2>
            <p className="workflow-subtitle">
              Four-stage analysis powered by BaseChain's Universal Smart Contracts and AI intelligence
            </p>
          </motion.div>

          <div className="workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="workflow-step"
              >
                {/* Connection Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="workflow-connector" />
                )}

                {/* Step Number */}
                <div className={`step-number step-${step.color}`}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className="step-icon">
                  <step.icon className={`h-12 w-12 text-${step.color}-400`} />
                </div>

                {/* Content */}
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            {/* Left Side - Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logos/logo.png" alt="BaseGuardian Logo" className="footer-logo-img" />
                <span className="footer-logo-text">BaseGuardian</span>
              </div>
              <p className="footer-tagline">
                Your decentralized security deserves a beautiful home.
              </p>
              <a href="/contract-analysis" className="footer-cta-btn">
                Start for free →
              </a>
            </div>

            {/* Right Side - Links */}
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">PLATFORM</h4>
                <ul className="footer-link-list">
                  <li><Link to="/contract-analysis" className="footer-link">Contract Analysis</Link></li>
                  <li><Link to="/tokenomics" className="footer-link">Tokenomics</Link></li>
                  <li><Link to="/social-analysis" className="footer-link">Social Forensics</Link></li>
                  <li><Link to="/monitoring" className="footer-link">Monitoring</Link></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">SOLUTIONS</h4>
                <ul className="footer-link-list">
                  <li><a href="#" className="footer-link">BaseGuardian AI</a></li>
                  <li><a href="#" className="footer-link">Risk Scanner</a></li>
                  <li><a href="#" className="footer-link">Portfolio Guard</a></li>
                  <li><Link to="/send-message" className="footer-link">Send Message</Link></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">RESOURCES</h4>
                <ul className="footer-link-list">
                  <li><a href="#" className="footer-link">Documentation</a></li>
                  <li><a href="#" className="footer-link">API Guide</a></li>
                  <li><a href="#" className="footer-link">Community</a></li>
                  <li><a href="#" className="footer-link">Changelog</a></li>
                  <li><a href="#" className="footer-link">Security & Compliance</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">COMPANY</h4>
                <ul className="footer-link-list">
                  <li><a href="#" className="footer-link">About</a></li>
                  <li><a href="#" className="footer-link">Careers</a></li>
                  <li><a href="#" className="footer-link">Contact & Support</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p className="footer-copyright">© 2025 Copyright BaseGuardian INC. Powered by BaseChain. Built with ❤️ for DeFi security.</p>
              <div className="footer-legal">
                <a href="#" className="footer-legal-link">Terms & Conditions</a>
                <a href="#" className="footer-legal-link">Privacy</a>
              </div>
            </div>
            <div className="footer-bottom-right">
              <div className="footer-social">
                <a 
                  href="https://github.com/ombaviskar18/BaseGaurdian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  title="GitHub"
                >
                  <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/om-baviskar-/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  title="LinkedIn"
                >
                  <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="social-icon-link"
                  title="Twitter"
                >
                  <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="social-icon-link"
                  title="YouTube"
                >
                  <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}