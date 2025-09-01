import './ConfirmedContent.css';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

import { Button } from './components/Button';
import { IconReceived, IconSpinner } from './components/icons';
import {
  type SupportedChain,
  BaseCHAIN_ATHENS_BLOCKSCOUT_EXPLORER_URL,
} from './constants/chains';
import { type CrossChainTxResponse } from './types/cctx';

const CCTX_POLLING_URL =
  'https://Basechain-athens.blockpi.network/lcd/v1/public/Base-chain/crosschain/inboundHashToCctxData';

interface ConfirmedContentProps {
  supportedChain: SupportedChain | undefined;
  connectedChainTxHash: string;
  handleSendAnotherMessage: () => void;
  stringValue: string;
}

const MAX_STRING_LENGTH = 20;

export function ConfirmedContent({
  supportedChain,
  connectedChainTxHash,
  handleSendAnotherMessage,
  stringValue,
}: ConfirmedContentProps) {
  const [BasechainTxHash, setBasechainTxHash] = useState<string | null>(null);
  const renderString = useMemo(() => {
    if (stringValue.length > MAX_STRING_LENGTH) {
      return stringValue.slice(0, MAX_STRING_LENGTH) + '...';
    }
    return stringValue;
  }, [stringValue]);

  // Poll for the BaseChain transaction status every 15 seconds
  useEffect(() => {
    if (!connectedChainTxHash || BasechainTxHash) {
      return;
    }

    const poll = async () => {
      try {
        const response = await fetch(
          `${CCTX_POLLING_URL}/${connectedChainTxHash}`
        );
        if (response.ok) {
          const data = (await response.json()) as CrossChainTxResponse;
          const txHash = data.CrossChainTxs?.[0]?.outbound_params?.[0]?.hash;
          if (txHash) {
            setBasechainTxHash(txHash);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
    const intervalId = setInterval(poll, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [connectedChainTxHash, BasechainTxHash]);

  return (
    <div className="confirmed-content">
      <IconReceived />
      <h2 className="confirmed-content-title">
        "{renderString}" {!BasechainTxHash ? 'in Transit' : 'Received'}
      </h2>
      <div className="confirmed-content-links-container">
        {supportedChain && (
          <div className="confirmed-content-link-chain">
            {!connectedChainTxHash && <IconSpinner />}
            <a
              href={`${supportedChain.explorerUrl}${connectedChainTxHash}`}
              target="_blank"
              rel="noreferrer noopener"
              className={clsx('confirmed-content-link', {
                'confirmed-content-link-enabled': connectedChainTxHash,
                'confirmed-content-link-disabled': !connectedChainTxHash,
              })}
            >
              View on {supportedChain.name}
            </a>
          </div>
        )}
        {connectedChainTxHash && (
          <div className="confirmed-content-link-chain">
            {!BasechainTxHash && <IconSpinner />}
            <a
              href={`${BaseCHAIN_ATHENS_BLOCKSCOUT_EXPLORER_URL}${BasechainTxHash}`}
              target="_blank"
              rel="noreferrer noopener"
              className={clsx('confirmed-content-link', {
                'confirmed-content-link-enabled': BasechainTxHash,
                'confirmed-content-link-disabled': !BasechainTxHash,
              })}
            >
              View on BaseChain
            </a>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="thin"
        disabled={!connectedChainTxHash || !BasechainTxHash}
        onClick={() => {
          handleSendAnotherMessage();
          setBasechainTxHash(null);
        }}
      >
        Send Another
      </Button>
    </div>
  );
}
