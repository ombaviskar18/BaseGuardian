'use client';

import { type ReactNode, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { WalletContext } from './WalletContext';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const contextValue = useMemo(
    () => ({
      providers: connectors.map((c) => ({ info: { name: c.name, uuid: c.id, rdns: c.id }, provider: {} as any })),
      selectedProvider: null,
      connecting: isPending,
      reconnecting: false,
      isConnected,
      isSupportedChain: chainId === 84532,
      decimalChainId: chainId,
      error: null,
      connectWallet: async () => {
        try { await connect({ connector: connectors[0] }); return { success: true, account: address ?? undefined }; } catch (e: any) { return { success: false, error: e?.message ?? 'Failed' }; }
      },
      disconnectWallet: () => disconnect(),
      account: address ?? null,
    }),
    [address, isConnected, chainId, isPending, connect, connectors, disconnect]
  );

  return (
    <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
  );
};
