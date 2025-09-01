import './DisconnectedContent.css';

import { ConnectWallet } from './components/ConnectWallet';
import { IconAnimation } from './components/icons/IconAnimation';
import { IconBaseChainLogo } from './components/icons/IconBaseChainLogo';

export function DisconnectedContent() {
  return (
    <div className="main-container">
      <div className="hero-content-container">
        <div className="hero-content">
          <div className="hero-content-header">
            <h1 className="hero-content-header-title">Send Message</h1>
           
          </div>
          <p className="hero-content-description">
            Connect your EVM wallet and trigger contract on
            BaseChain testnet from any currently supported EVM chain.
          </p>
          <ConnectWallet />
        </div>
        <div className="hero-content-animation">
          <IconAnimation />
        </div>
      </div>
    </div>
  );
}
