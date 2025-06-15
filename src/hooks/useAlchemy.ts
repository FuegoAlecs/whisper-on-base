
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

      console.log('Analyzing wallet:', address);
      console.log('Using API endpoint:', baseUrl);

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
      console.log('ETH balance response:', ethData);
      
      if (ethData.error) {
        throw new Error(`Alchemy API error: ${ethData.error.message}`);
      }

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
      console.log('Token balance response:', tokenData);

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
      console.log('Transaction count response:', txData);

      // Check if address is a contract
      const codeResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 4,
          method: 'eth_getCode',
          params: [address, 'latest']
        })
      });

      const codeData = await codeResponse.json();
      const isContract = codeData.result && codeData.result !== '0x';

      // Process token balances
      let processedTokenBalances: TokenBalance[] = [];
      if (tokenData.result && tokenData.result.tokenBalances) {
        processedTokenBalances = tokenData.result.tokenBalances
          .filter((token: any) => token.tokenBalance && token.tokenBalance !== '0x0')
          .map((token: any) => ({
            contractAddress: token.contractAddress,
            tokenBalance: parseInt(token.tokenBalance, 16).toString(),
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'UNKNOWN',
            decimals: token.decimals || 18
          }));
      }

      const result = {
        address,
        ethBalance: ethBalance.toString(),
        tokenBalances: processedTokenBalances,
        transactionCount: parseInt(txData.result, 16),
        isContract
      };

      console.log('Final wallet analysis result:', result);
      return result;

    } catch (error) {
      console.error('Alchemy API error:', error);
      throw new Error('Failed to fetch wallet data from Alchemy');
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeWallet, isLoading };
};
