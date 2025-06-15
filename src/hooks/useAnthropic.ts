import { useState } from 'react';
import { useAlchemy } from './useAlchemy';

interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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
        try {
          const walletData = await analyzeWallet(address);
          
          if (walletData) {
            const tokenList = walletData.tokenBalances.length > 0 
              ? walletData.tokenBalances.map(token => 
                  `• ${token.symbol || 'Unknown'}: ${token.tokenBalance}`
                ).join('\n')
              : '• No significant token balances found';

            return `🔍 **Wallet Analysis for ${address}**

📊 **Overview:**
• ETH Balance: ${parseFloat(walletData.ethBalance).toFixed(6)} ETH
• Transaction Count: ${walletData.transactionCount} transactions
• Account Type: ${walletData.isContract ? 'Smart Contract' : 'Externally Owned Account (EOA)'}

💰 **Token Holdings:**
${tokenList}

🎯 **Insights:**
• This wallet ${walletData.transactionCount > 100 ? 'appears to be actively used' : 'has moderate activity'}
• ETH balance suggests ${parseFloat(walletData.ethBalance) > 0.1 ? 'active user' : 'minimal ETH holdings'}
• ${walletData.tokenBalances.length > 0 ? 'Holds multiple tokens indicating DeFi participation' : 'Primarily holds ETH'}

Would you like me to analyze specific transactions, DeFi positions, or NFT holdings for this wallet?`;
          }
        } catch (error) {
          return `❌ Unable to analyze wallet ${address}. This could be due to:
• Invalid address format
• Network connectivity issues
• API rate limits

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
