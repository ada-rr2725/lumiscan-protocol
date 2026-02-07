'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  flare,
  flareTestnet,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const { wallets } = getDefaultWallets();

// We customize the default wallets to include Flare-specific options
const config = getDefaultConfig({
  appName: 'Lumiscan',
  projectId: 'e4fd0390e7883b447d617fe31958afdd',
  chains: [flare, flareTestnet], // target Flare Mainnet & Coston2
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
            chains={[flare, flareTestnet]}
            theme={darkTheme({
                accentColor: '#FF5F1F', // Flare Orange
                accentColorForeground: 'white',
                borderRadius: 'none', // Institutional look
                fontStack: 'system',
                overlayBlur: 'small',
            })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}