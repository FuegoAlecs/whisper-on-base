
import { useState } from 'react';

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messages: OpenAIMessage[], apiKey: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: `You are ChainWhisper, an AI oracle specialized in Base network blockchain data analysis. You provide insights about:
              - NFT minting activity and collections
              - DeFi protocols and transactions
              - Gas usage and network metrics
              - Wallet analysis and risk assessment
              - Token movements and trading patterns
              
              Always respond with specific, actionable blockchain insights. Use emojis and format your responses clearly with bullet points when appropriate.`
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};
