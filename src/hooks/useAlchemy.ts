
import { useState } from 'react';

interface AlchemyConfig {
  apiKey: string;
  network: 'base-mainnet' | 'base-sepolia';
}

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

interface WalletAnalysis {
  address: string;
  ethBalance: string;
  tokenBalances: TokenBalance[];
  transactionCount: number;
  isContract: boolean;
}

export const useAlchemy = () => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWallet = async (address: string, config?: AlchemyConfig): Promise<WalletAnalysis | null> => {
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new Error('Invalid wallet address format');
    }

    setIsLoading(true);

    try {
      // For now, we'll use demo data until user provides Alchemy API key
      if (!config?.apiKey) {
        // Mock analysis with realistic Base data
        return {
          address,
          ethBalance: '0.247891234567890123',
          tokenBalances: [
            {
              contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
              tokenBalance: '150.75',
              name: 'USD Coin',
              symbol: 'USDC',
              decimals: 6
            },
            {
              contractAddress: '0x4200000000000000000000000000000000000006',
              tokenBalance: '0.892345',
              name: 'Wrapped Ether',
              symbol: 'WETH',
              decimals: 18
            }
          ],
          transactionCount: 127,
          isContract: false
        };
      }

      // Real Alchemy API calls would go here
      const baseUrl = config.network === 'base-sepolia' 
        ? `https://base-sepolia.g.alchemy.com/v2/${config.apiKey}`
        : `https://base-mainnet.g.alchemy.com/v2/${config.apiKey}`;

      // Get ETH balance
      const ethBalanceResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
      });

      const ethData = await ethBalanceResponse.json();
      const ethBalance = parseInt(ethData.result, 16) / Math.pow(10, 18);

      // Get token balances
      const tokenResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getTokenBalances',
          params: [address]
        })
      });

      const tokenData = await tokenResponse.json();

      // Get transaction count
      const txCountResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'eth_getTransactionCount',
          params: [address, 'latest']
        })
      });

      const txData = await txCountResponse.json();

      return {
        address,
        ethBalance: ethBalance.toString(),
        tokenBalances: tokenData.result?.tokenBalances || [],
        transactionCount: parseInt(txData.result, 16),
        isContract: false // Would need additional call to determine this
      };

    } catch (error) {
      console.error('Alchemy API error:', error);
      throw new Error('Failed to fetch wallet data from Alchemy');
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeWallet, isLoading };
};
