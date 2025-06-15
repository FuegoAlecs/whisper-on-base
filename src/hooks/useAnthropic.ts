
import { useState } from 'react';
import { useAlchemy } from './useAlchemy';

const CONCEPTUAL_AI_API_KEY = "USER_WOULD_PROVIDE_A_REAL_KEY_HERE_OR_VIA_BACKEND";

interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const constructAIWalletAnalysisPrompt = (userQuery: string, walletData: any): string => {
  const tokenBalancesString = walletData.tokenBalances.length > 0
    ? walletData.tokenBalances.map((token: any) =>
        `- Contract: ${token.contractAddress}, Balance: ${(parseFloat(token.tokenBalance) / Math.pow(10, token.decimals || 18)).toFixed(6)} ${token.symbol || '[Symbol Missing]'} (${token.name || '[Name Missing]'})${token.decimals ? `, Decimals: ${token.decimals}` : ''}`
      ).join('\n')
    : "No significant token balances found.";

  const prompt = `
System: You are ChainWhisper, an AI assistant specializing in analyzing Ethereum wallet addresses on the Base network. Your goal is to provide clear, conversational, and insightful summaries based on data retrieved from Alchemy. Be factual and avoid speculation if data is missing. If token names or symbols are shown as '[Name Missing]' or '[Symbol Missing]', it means this information was not available from the data source; acknowledge this if relevant in your analysis.

User:
My query was: "${userQuery}"

Here is the data fetched from Alchemy for the wallet address ${walletData.address}:

Wallet Address: ${walletData.address}
Account Type: ${walletData.isContract ? 'Smart Contract' : 'Externally Owned Account (EOA)'}
ETH Balance: ${walletData.ethBalance} ETH
Transaction Count: ${walletData.transactionCount}

Token Holdings:
${tokenBalancesString}
---

Based on my query and the provided Alchemy data, please:
1. Provide a conversational summary of this wallet's key characteristics.
2. Highlight any interesting insights or patterns you observe (e.g., activity level, types of tokens held, significant ETH balance).
3. If symbols or names are missing for tokens with balances (indicated by '[Symbol Missing]' or '[Name Missing]'), briefly explain in your own words that this metadata wasn't provided.
4. Conclude by suggesting 1-2 relevant follow-up questions a user might have about this wallet, if appropriate. For example, "Would you like to see recent transactions?" or "Are you interested in its interaction with any specific DeFi protocols?"
`;
  // console.log('[Debug AI] Constructed Prompt:', prompt); // Optional: for debugging prompt
  return prompt;
};

const callConceptualAIAPI = async (prompt: string): Promise<string> => {
  console.log("[Debug AI] Calling Conceptual AI API with prompt (first 100 chars):", prompt.substring(0, 100));
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real scenario, this would be:
  // const response = await fetch('AI_SERVICE_ENDPOINT', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${CONCEPTUAL_AI_API_KEY}` // Or other auth method
  //   },
  //   body: JSON.stringify({ prompt: prompt, model: "chosen-model-name", /* other params */ })
  // });
  // if (!response.ok) { throw new Error('AI API call failed'); }
  // const aiData = await response.json();
  // return aiData.choices[0].text; // Or however the specific AI API returns data

  // For now, return a MOCKED response:
  const mockAIResponse = `This is a simulated AI response based on the data for the wallet.
It would normally provide a conversational summary and insights here.
For instance, it might say: 'This wallet (${prompt.match(/Wallet Address: (0x[a-fA-F0-9]{40})/)?.[1]}) shows X ETH and Y transactions. It holds Z tokens, some of which we don't have symbol data for. Would you like to dive deeper into its transaction history?'`;
  console.log("[Debug AI] Returning Mocked AI Response:", mockAIResponse);
  return mockAIResponse;
};

export const useAnthropic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { analyzeWallet, isLoading: alchemyLoading } = useAlchemy();

  const sendMessage = async (messages: AnthropicMessage[], apiKey?: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage = messages[messages.length - 1].content;
      const lowerMessage = userMessage.toLowerCase();
      
      // Check if message contains a wallet address
      const walletAddressMatch = userMessage.match(/0x[a-fA-F0-9]{40}/);
      
      if (walletAddressMatch) {
        const address = walletAddressMatch[0];
        console.log('Wallet address detected:', address);
        
        try {
          const walletData = await analyzeWallet(address);
          console.log('[Debug Anthropic] Received walletData from useAlchemy:', JSON.stringify(walletData, null, 2));
          
          if (walletData) {
            console.log('Wallet analysis successful:', walletData);
            
            // const userMessage = messages[messages.length - 1].content; // Already exists
            const prompt = constructAIWalletAnalysisPrompt(userMessage, walletData);
            const aiResponse = await callConceptualAIAPI(prompt);
            return aiResponse; // This is the new return for successful wallet analysis
          } else {
            return `❌ Unable to retrieve data for wallet ${address}. The wallet may be empty or there might be an API issue.`;
          }
        } catch (error) {
          console.error('Wallet analysis error:', error);
          return `❌ Error analyzing wallet ${address}: ${error instanceof Error ? error.message : 'Unknown error'}

This could be due to:
• Invalid address format
• Network connectivity issues  
• API rate limits
• Wallet not found on Base network

Please verify the address and try again. I can help with other Base blockchain analysis in the meantime!`;
        }
      }
      
      // Keep existing conversation patterns
      if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        return "Hello! I'm ChainWhisper, your AI assistant for Base network analysis. I can help you with wallet activity, NFT data, DeFi protocols, and on-chain analytics. What would you like to explore?";
      }
      
      if (lowerMessage.includes('base') && (lowerMessage.includes('defi') || lowerMessage.includes('activity'))) {
        return "I'd love to help you analyze Base DeFi activity! I can provide insights on:\n\n• Total Value Locked (TVL) across protocols\n• Recent transaction volumes\n• Top performing DeFi protocols\n• Yield farming opportunities\n• Liquidity pool analysis\n\nWhat specific aspect of Base DeFi would you like me to investigate?";
      }
      
      if (lowerMessage.includes('nft') || lowerMessage.includes('mint')) {
        return "I can analyze NFT activity on Base! Here's what I can help with:\n\n• Top minting wallets and volumes\n• Popular NFT collections\n• Minting trends and patterns\n• Wallet behavior analysis\n• Gas optimization for minting\n\nWhat specific NFT data are you looking for?";
      }
      
      if (lowerMessage.includes('wallet') && !walletAddressMatch) {
        return "I can analyze wallet activity on Base! I can provide:\n\n• Transaction history and patterns\n• Token holdings and transfers\n• DeFi protocol interactions\n• NFT collections owned\n• Risk assessment and scoring\n\nPlease share a wallet address (starting with 0x) that you'd like me to analyze!";
      }
      
      // Default response for Base-related queries
      return `I understand you're asking about: "${userMessage}"\n\nAs ChainWhisper, I specialize in Base network analysis. I can help with wallet tracking, DeFi analytics, NFT data, gas optimization, and on-chain investigations.\n\nCould you be more specific about what data or analysis you're looking for? For example:\n• A specific wallet address to analyze (0x...)\n• DeFi protocol performance\n• NFT collection statistics\n• Transaction patterns`;
      
    } catch (error) {
      console.error('Chat error:', error);
      return "I'm having trouble processing your request right now. Please try again in a moment!";
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading: isLoading || alchemyLoading };
};
