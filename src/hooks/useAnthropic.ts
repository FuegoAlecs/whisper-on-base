
import { useState } from 'react';

interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const useAnthropic = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messages: AnthropicMessage[], apiKey?: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // For now, we'll create a simple chatbot response until user provides their API key
      const userMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Simple pattern matching for common queries
      if (userMessage.includes('hi') || userMessage.includes('hello')) {
        return "Hello! I'm ChainWhisper, your AI assistant for Base network analysis. I can help you with wallet activity, NFT data, DeFi protocols, and on-chain analytics. What would you like to explore?";
      }
      
      if (userMessage.includes('base') && (userMessage.includes('defi') || userMessage.includes('activity'))) {
        return "I'd love to help you analyze Base DeFi activity! I can provide insights on:\n\n• Total Value Locked (TVL) across protocols\n• Recent transaction volumes\n• Top performing DeFi protocols\n• Yield farming opportunities\n• Liquidity pool analysis\n\nWhat specific aspect of Base DeFi would you like me to investigate?";
      }
      
      if (userMessage.includes('nft') || userMessage.includes('mint')) {
        return "I can analyze NFT activity on Base! Here's what I can help with:\n\n• Top minting wallets and volumes\n• Popular NFT collections\n• Minting trends and patterns\n• Wallet behavior analysis\n• Gas optimization for minting\n\nWhat specific NFT data are you looking for?";
      }
      
      if (userMessage.includes('wallet') || userMessage.startsWith('0x')) {
        return "I can analyze wallet activity on Base! I can provide:\n\n• Transaction history and patterns\n• Token holdings and transfers\n• DeFi protocol interactions\n• NFT collections owned\n• Risk assessment and scoring\n\nPlease share the wallet address you'd like me to analyze, or let me know what specific wallet metrics you're interested in!";
      }
      
      // Default response for Base-related queries
      return `I understand you're asking about: "${messages[messages.length - 1].content}"\n\nAs ChainWhisper, I specialize in Base network analysis. I can help with wallet tracking, DeFi analytics, NFT data, gas optimization, and on-chain investigations.\n\nCould you be more specific about what data or analysis you're looking for? For example:\n• A specific wallet address to analyze\n• DeFi protocol performance\n• NFT collection statistics\n• Transaction patterns`;
      
    } catch (error) {
      console.error('Chat error:', error);
      return "I'm having trouble processing your request right now. Please try again in a moment!";
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};
