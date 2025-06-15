
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

const ALCHEMY_API_KEY = 'jFa3wNWqfvKYb9GrCUtmk';

export const useAlchemy = () => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWallet = async (address: string, config?: AlchemyConfig): Promise<WalletAnalysis | null> => {
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new Error('Invalid wallet address format');
    }

    setIsLoading(true);

    try {
      const apiKey = config?.apiKey || ALCHEMY_API_KEY;
      const baseUrl = config?.network === 'base-sepolia' 
        ? `https://base-sepolia.g.alchemy.com/v2/${apiKey}`
        : `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;

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
