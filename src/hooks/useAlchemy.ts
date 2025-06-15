
import { useState } from 'react';

const weiToGwei = (wei: string): string => {
  const gwei = parseInt(wei, 16) / 1e9;
  return gwei.toFixed(2); // Or adjust precision as needed
};

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

interface NftMintEvent {
  transactionHash: string;
  blockNumber: string;
  timestamp?: string;
  nftContractAddress: string | null; // rawContract.address can be null
  tokenId: string | null;
  minterAddress: string; // 'to' address
  collectionName?: string; // 'asset' field, or from metadata if we enhance
  tokenType: "erc721" | "erc1155" | "unknown";
}

interface TopTradingPairData {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseTokenSymbol: string;
  baseTokenAddress: string;
  quoteTokenSymbol: string;
  quoteTokenAddress: string;
  priceUsd?: number;
  volumeLastHour?: number;
  priceChangeLastHour?: number;
  pairUrl: string;
}

const FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER = "OA8inGxL7DDI-mzrnnBi8";

export const useAlchemy = () => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWallet = async (address: string, config?: AlchemyConfig): Promise<WalletAnalysis | null> => {
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new Error('Invalid wallet address format');
    }

    setIsLoading(true);

    let effectiveApiKey = FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER; // Default to hardcoded key
    if (typeof window !== 'undefined') { // Check if localStorage is available
        const storedKey = localStorage.getItem('chainwhisper_alchemy_key');
        if (storedKey && storedKey.trim() !== '') {
            effectiveApiKey = storedKey.trim();
            console.log('Using API key from local storage.');
        } else {
            console.log('No API key in local storage or key is empty, using default.');
        }
    } else {
        console.log('localStorage not available, using default API key.');
    }
    console.log('[Debug Alchemy] Using effectiveApiKey:', effectiveApiKey);

    try {
      const apiKey = config?.apiKey || effectiveApiKey;
      const baseUrl = config?.network === 'base-sepolia' 
        ? `https://base-sepolia.g.alchemy.com/v2/${apiKey}`
        : `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;

      console.log('Analyzing wallet:', address);
      console.log('Using API endpoint:', baseUrl);

      // Get ETH balance
      const ethBalancePayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      };
      console.log('[Debug Alchemy] eth_getBalance request:', JSON.stringify(ethBalancePayload));
      const ethBalanceResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ethBalancePayload)
      });

      const ethData = await ethBalanceResponse.json();
      console.log('[Debug Alchemy] eth_getBalance raw response:', JSON.stringify(ethData));
      console.log('ETH balance response:', ethData);
      
      if (ethData.error) {
        throw new Error(`Alchemy API error: ${ethData.error.message}`);
      }

      const ethBalance = parseInt(ethData.result, 16) / Math.pow(10, 18);

      // Get token balances
      const tokenPayload = {
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getTokenBalances',
        params: [address]
      };
      console.log('[Debug Alchemy] alchemy_getTokenBalances request:', JSON.stringify(tokenPayload));
      const tokenResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenPayload)
      });

      const tokenData = await tokenResponse.json();
      console.log('[Debug Alchemy] alchemy_getTokenBalances raw response:', JSON.stringify(tokenData));
      console.log('Token balance response:', tokenData);

      // Get transaction count
      const txCountPayload = {
        jsonrpc: '2.0',
        id: 3,
        method: 'eth_getTransactionCount',
        params: [address, 'latest']
      };
      console.log('[Debug Alchemy] eth_getTransactionCount request:', JSON.stringify(txCountPayload));
      const txCountResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txCountPayload)
      });

      const txData = await txCountResponse.json();
      console.log('[Debug Alchemy] eth_getTransactionCount raw response:', JSON.stringify(txData));
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
            name: token.name || '[Name Missing]',
            symbol: token.symbol || '[Symbol Missing]',
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

  const getTopTradedTokens = async (options?: { limit?: number }): Promise<TopTradingPairData[] | null> => {
    setIsLoading(true); // Reuse isLoading state from useAlchemy
    const limit = options?.limit || 5; // Default to top 5 pairs
    // Query for popular pairs on Base. This might need refinement.
    // A more robust approach might involve multiple queries for common quote tokens
    // (e.g., WETH, USDC on Base) if 'q=base' is not effective.
    const searchQuery = "base"; // Initial simple query
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/search?q=${searchQuery}`;

    console.log(`[Debug DexScreener] Fetching top traded tokens with query: ${searchQuery}`);

    try {
      const response = await fetch(dexScreenerUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Error DexScreener] API call failed:', response.status, response.statusText, errorBody);
        throw new Error(`DexScreener API call failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      // console.log('[Debug DexScreener] Raw API Response:', JSON.stringify(data, null, 2)); // For deep debugging

      if (!data.pairs || data.pairs.length === 0) {
        console.log('[Debug DexScreener] No pairs found for the query.');
        return [];
      }

      const basePairs = data.pairs.filter((pair: any) => pair.chainId === 'base');
       // console.log(`[Debug DexScreener] Found ${basePairs.length} pairs on Base chain.`);

      const processedPairs: TopTradingPairData[] = basePairs.map((pair: any) => ({
        chainId: pair.chainId,
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
        baseTokenSymbol: pair.baseToken?.symbol,
        baseTokenAddress: pair.baseToken?.address,
        quoteTokenSymbol: pair.quoteToken?.symbol,
        quoteTokenAddress: pair.quoteToken?.address,
        priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : undefined,
        volumeLastHour: pair.volume?.h1, // Assuming h1 is hourly volume in USD
        priceChangeLastHour: pair.priceChange?.h1,
        pairUrl: pair.url,
      }));

      // Sort by volume in the last hour (descending)
      processedPairs.sort((a, b) => (b.volumeLastHour || 0) - (a.volumeLastHour || 0));

      const topPairs = processedPairs.slice(0, limit);
      console.log(`[Debug DexScreener] Returning top ${topPairs.length} traded pairs.`);
      return topPairs;

    } catch (error: any) {
      console.error('[Error DexScreener] Error in getTopTradedTokens:', error);
      // In a real app, might want to distinguish error types or re-throw
      return null; // Or throw error to be caught by caller
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentGasPrice = async (): Promise<string | null> => {
    setIsLoading(true);
    let currentApiKey = FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER; // Fallback, consistent with other functions
    if (typeof window !== 'undefined') {
       const storedKey = localStorage.getItem('chainwhisper_alchemy_key');
       if (storedKey && storedKey.trim() !== '') {
           currentApiKey = storedKey.trim();
       }
    }
    const baseUrl = `https://base-mainnet.g.alchemy.com/v2/${currentApiKey}`;

    const payload = {
      jsonrpc: '2.0',
      id: 'alchemy-gasprice', // Unique ID
      method: 'eth_gasPrice',
      params: []
    };

    console.log('[Debug Alchemy] getCurrentGasPrice payload:', JSON.stringify(payload));

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Error Alchemy] getCurrentGasPrice API call failed:', response.status, response.statusText, errorBody);
        throw new Error(`Alchemy eth_gasPrice failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      if (data.error) {
        console.error('[Error Alchemy] getCurrentGasPrice API error:', data.error);
        throw new Error(`Alchemy API error: ${data.error.message}`);
      }

      if (data.result) {
        const gasPriceGwei = weiToGwei(data.result);
        console.log(`[Debug Alchemy] Gas Price (Wei): ${data.result}, (Gwei): ${gasPriceGwei}`);
        return `${gasPriceGwei} Gwei`;
      } else {
        console.log('[Debug Alchemy] No gas price result found.');
        return null;
      }
    } catch (error: any) {
      console.error('[Error Alchemy] Error in getCurrentGasPrice:', error);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestBlockNumber = async (): Promise<string | null> => {
    setIsLoading(true);
    let currentApiKey = FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER; // Fallback
    if (typeof window !== 'undefined') {
       const storedKey = localStorage.getItem('chainwhisper_alchemy_key');
       if (storedKey && storedKey.trim() !== '') {
           currentApiKey = storedKey.trim();
       }
    }
    const baseUrl = `https://base-mainnet.g.alchemy.com/v2/${currentApiKey}`;

    const payload = {
      jsonrpc: '2.0',
      id: 'alchemy-blocknumber', // Unique ID
      method: 'eth_blockNumber',
      params: []
    };

    console.log('[Debug Alchemy] getLatestBlockNumber payload:', JSON.stringify(payload));

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Error Alchemy] getLatestBlockNumber API call failed:', response.status, response.statusText, errorBody);
        throw new Error(`Alchemy eth_blockNumber failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      if (data.error) {
        console.error('[Error Alchemy] getLatestBlockNumber API error:', data.error);
        throw new Error(`Alchemy API error: ${data.error.message}`);
      }

      if (data.result) {
        const blockNumberDecimal = parseInt(data.result, 16).toString();
        console.log(`[Debug Alchemy] Latest Block (Hex): ${data.result}, (Decimal): ${blockNumberDecimal}`);
        return blockNumberDecimal;
      } else {
        console.log('[Debug Alchemy] No block number result found.');
        return null;
      }
    } catch (error: any) {
      console.error('[Error Alchemy] Error in getLatestBlockNumber:', error);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentNftMints = async (options?: { limit?: number; collectionAddress?: string }): Promise<NftMintEvent[] | null> => {
    setIsLoading(true); // Assuming setIsLoading is part of useAlchemy hook state

    // Determine API Key (reuse existing logic if analyzeWallet's key determination is suitable)
    // For simplicity, let's re-fetch or assume effectiveApiKey is available from hook's scope.
    // This part might need refinement based on how API key is managed across hook functions.
    // For now, assume 'effectiveApiKey' is accessible from the outer scope of useAlchemy or re-evaluate it.
    // Let's use a simplified key access for this subtask, assuming FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER exists.
    // A more robust solution would pass the key or ensure it's consistently derived.
    let currentApiKey = FALLBACK_ALCHEMY_API_KEY_PLACEHOLDER; // Fallback, ideally use the same logic as analyzeWallet
    if (typeof window !== 'undefined') {
       const storedKey = localStorage.getItem('chainwhisper_alchemy_key');
       if (storedKey && storedKey.trim() !== '') {
           currentApiKey = storedKey.trim();
       }
    }
    // Ensure this key logic is consistent if this were a production hook.

    const baseUrl = `https://base-mainnet.g.alchemy.com/v2/${currentApiKey}`;
    const limit = options?.limit || 10;

    const payload: any = {
      jsonrpc: '2.0',
      id: 1, // Consider using a different ID than analyzeWallet if calls can overlap
      method: 'alchemy_getAssetTransfers',
      params: [{
        fromBlock: '0x0', // Not strictly needed if ordering by latest
        toBlock: 'latest',
        fromAddress: '0x0000000000000000000000000000000000000000',
        category: ['erc721', 'erc1155'],
        order: 'desc',
        withMetadata: true,
        maxCount: '0x' + limit.toString(16), // Convert limit to hex
        excludeZeroValue: true, // Default, generally okay for NFTs
      }]
    };

    if (options?.collectionAddress) {
      payload.params[0].contractAddresses = [options.collectionAddress];
    }

    console.log('[Debug Alchemy] getRecentNftMints payload:', JSON.stringify(payload));

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Error Alchemy] getRecentNftMints API call failed:', response.status, response.statusText, errorBody);
        throw new Error(`Alchemy getRecentNftMints failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      // console.log('[Debug Alchemy] getRecentNftMints raw response:', JSON.stringify(data));

      if (data.error) {
        console.error('[Error Alchemy] getRecentNftMints API error:', data.error);
        throw new Error(`Alchemy API error: ${data.error.message}`);
      }

      if (data.result && data.result.transfers) {
        const mints: NftMintEvent[] = data.result.transfers.map((transfer: any) => ({
          transactionHash: transfer.hash,
          blockNumber: transfer.blockNum,
          timestamp: transfer.metadata?.blockTimestamp,
          nftContractAddress: transfer.rawContract?.address,
          tokenId: transfer.erc721TokenId || (transfer.erc1155Metadata && transfer.erc1155Metadata[0] ? transfer.erc1155Metadata[0].tokenId : null),
          minterAddress: transfer.to,
          collectionName: transfer.asset, // 'asset' field might hold the collection symbol
          tokenType: transfer.category as ("erc721" | "erc1155" | "unknown"),
        }));
        console.log(`[Debug Alchemy] Processed ${mints.length} NFT mints.`);
        return mints;
      } else {
        console.log('[Debug Alchemy] No transfers found or unexpected structure.');
        return [];
      }
    } catch (error: any) {
      console.error('[Error Alchemy] Error in getRecentNftMints:', error);
      throw error; // Re-throw to be caught by caller if needed, or return null/empty
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeWallet, getRecentNftMints, getCurrentGasPrice, getLatestBlockNumber, getTopTradedTokens, isLoading };
};
