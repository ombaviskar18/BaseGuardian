import './PricingPage.css';
import { Zap, Shield, Users, BarChart3, Eye, Download, Clock, Globe, Lock, Headphones, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPage = () => {
  const features = {
    free: [
      { icon: Eye, text: '3 Social Analysis Scans per day', description: 'Basic sentiment and trend analysis' },
      { icon: Shield, text: 'Contract Quick Scan', description: 'Basic security vulnerability check' },
      { icon: BarChart3, text: 'Community Charts', description: 'Basic token holder distribution' },
      { icon: Clock, text: '24-hour Data Retention', description: 'Access to recent analysis data' },
      { icon: Globe, text: 'Public Token Support', description: 'Analyze popular tokens only' },
    ],
    pro: [
      { icon: Eye, text: 'Unlimited Social Analysis', description: 'Comprehensive sentiment' },
      { icon: Zap, text: 'AI Trading Insights', description: 'Advanced market prediction algorithms' },
      { icon: Shield, text: 'Real-time Monitoring Alerts', description: 'Instant notifications for market' },
      { icon: Download, text: 'Export PDF Reports', description: 'Professional analysis ' },
      { icon: BarChart3, text: 'Advanced Analytics Dashboard', description: 'Detailed metrics and visualizations' },
     ],
    enterprise: [
      { icon: Users, text: 'Team Seats & SSO', description: 'Multi-user access with single sign-on' },
      { icon: Headphones, text: 'Dedicated Support', description: '24/7 personalized assistance' },
      { icon: Lock, text: 'SLA & On-Prem Options', description: 'Service level agreements and private deployment' },
      { icon: Rocket, text: 'Custom Integrations', description: 'API access and custom workflows' },
      { icon: Shield, text: 'Advanced Security', description: 'Enhanced security protocols and compliance' },
     ]
  };

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="pricing-hero">
        <div className="pricing-hero-content">
          <h1 className="pricing-title">
            Choose Your <span className="gradient-text">Guardian</span> Plan
          </h1>
          <p className="pricing-subtitle">
            Advanced blockchain security and social analysis tools to protect your investments (Coming Soon🔜)
          </p>
          <div className="faucet-section">
            <a 
              href="https://cloud.google.com/application/web3/faucet/Basechain/testnet" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="faucet-button"
            >
              <Zap className="faucet-icon" />
              Get Faucet (for using free plan)
            </a>
          </div>
          <div className="pricing-badges">
            <div className="badge">
              <Shield className="badge-icon" />
              <span>Trusted by 10,000+ users</span>
            </div>
            <div className="badge">
              <Zap className="badge-icon" />
              <span>Real-time monitoring</span>
            </div>
            <div className="badge">
              <Globe className="badge-icon" />
              <span>Multi-chain support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-container">
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card free-card">
            <div className="card-header">
              <div className="plan-badge free">Free</div>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">/month</span>
              </div>
              <p className="plan-description">Perfect for getting started with basic analysis</p>
            </div>
            <div className="card-features">
              {features.free.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <feature.icon className="icon" />
                  </div>
                  <div className="feature-content">
                    <div className="feature-text">{feature.text}</div>
                    <div className="feature-description">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <Link to="/social-analysis" className="plan-button free-button">
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card pro-card featured">
            <div className="card-header">
              <div className="plan-badge pro">Pro</div>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">19</span>
                <span className="period">/month</span>
              </div>
              <p className="plan-description">Advanced features for serious investors and traders</p>
            </div>
            <div className="card-features">
              {features.pro.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon pro">
                    <feature.icon className="icon" />
                  </div>
                  <div className="feature-content">
                    <div className="feature-text">{feature.text}</div>
                    <div className="feature-description">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <button className="plan-button pro-button">
                Start Pro Trial
              </button>
              <p className="trial-text">14-day free trial, no credit card required</p>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card enterprise-card">
            <div className="card-header">
              <div className="plan-badge enterprise">Enterprise</div>
              <div className="plan-price">
                <span className="amount">Custom</span>
                <span className="period">/month</span>
              </div>
              <p className="plan-description">Tailored solutions for teams and organizations</p>
            </div>
            <div className="card-features">
              {features.enterprise.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon enterprise">
                    <feature.icon className="icon" />
                  </div>
                  <div className="feature-content">
                    <div className="feature-text">{feature.text}</div>
                    <div className="feature-description">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <button className="plan-button enterprise-button">
                Contact Sales
              </button>
              <p className="contact-text">Get a custom quote for your needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I upgrade or downgrade my plan anytime?</h3>
            <p>Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin, Ethereum, and USDC.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial available?</h3>
            <p>Yes! Pro plans come with a 14-day free trial. No credit card required to start your trial.</p>
          </div>
          <div className="faq-item">
            <h3>How accurate are your AI predictions?</h3>
            <p>Our AI models achieve 85%+ accuracy on historical data, but past performance doesn't guarantee future results.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer refunds?</h3>
            <p>We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment.</p>
          </div>
          <div className="faq-item">
            <h3>What kind of support do you provide?</h3>
            <p>Free users get community support, Pro users get priority email support, and Enterprise users get dedicated 24/7 support.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Investments?</h2>
          <p>Join thousands of users who trust BaseGuardian for their blockchain security needs</p>
          <div className="cta-buttons">
            <Link to="/social-analysis" className="cta-button primary">
              Start Free Analysis
            </Link>
            <button className="cta-button secondary">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
