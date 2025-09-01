import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, BarChart3, Eye, Zap, MessageCircle, Menu, X, DollarSign } from 'lucide-react';
import { useState } from 'react';

import { useWallet } from '../hooks/useWallet';
import { ConnectWallet } from './ConnectWallet';
import { WalletControls } from './WalletControls';

export const Header = () => {
  const { account } = useWallet();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/contract-analysis', label: 'Contract Analysis', icon: Shield },
    { path: '/tokenomics', label: 'Tokenomics', icon: BarChart3 },
    { path: '/social-analysis', label: 'Social Analysis', icon: Eye },
    { path: '/monitoring', label: 'Monitoring', icon: Zap },
    { path: '/send-message', label: 'Send Message', icon: MessageCircle },
  ];

  const toggleMobileMenu = () => { setIsMobileMenuOpen(!isMobileMenuOpen); };
  const closeMobileMenu = () => { setIsMobileMenuOpen(false); };

  return (
    <div className="header-container">
      <div className="header-nav">
        <Link to="/" className="header-logo" onClick={closeMobileMenu}>
          <img src="/logos/logo.png" alt="BaseGuardian Logo" className="header-logo-img" />
          <span className="title-line-2">BaseGuardian</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="header-links desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`header-link ${location.pathname === link.path ? 'active' : ''}`} onClick={closeMobileMenu}>
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          ))}
          <Link to="/pricing" className={`header-link ${location.pathname === '/pricing' ? 'active' : ''}`} onClick={closeMobileMenu}>
            <DollarSign className="h-4 w-4" />
            <span>Pricing</span>
          </Link>
        </nav>
        {/* Mobile Menu Button */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      <div className="header-controls">
        {!account ? (<div className="lg-only"><ConnectWallet /></div>) : (<WalletControls />)}
      </div>
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close mobile menu"><X className="h-6 w-6" /></button>
            </div>
            <div className="mobile-menu-links">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`mobile-menu-link ${location.pathname === link.path ? 'active' : ''}`} onClick={closeMobileMenu}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <Link to="/pricing" className={`mobile-menu-link ${location.pathname === '/pricing' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <DollarSign className="h-5 w-5" />
                <span>Pricing</span>
              </Link>
            </div>
            {!account && (<div className="mobile-connect-wallet"><ConnectWallet /></div>)}
          </nav>
        </div>
      )}
    </div>
  );
};
