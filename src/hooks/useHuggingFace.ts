
import { useState } from 'react';

interface HuggingFaceMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const useHuggingFace = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messages: HuggingFaceMessage[], apiKey?: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Use the free Hugging Face Inference API
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          inputs: messages[messages.length - 1].content,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        // If the first model fails, try a backup model
        const backupResponse = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: messages[messages.length - 1].content,
          }),
        });

        if (!backupResponse.ok) {
          throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const backupData = await backupResponse.json();
        return backupData[0]?.generated_text || 'Sorry, I could not generate a response.';
      }

      const data = await response.json();
      return data[0]?.generated_text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Hugging Face API error:', error);
      
      // Fallback response for blockchain/crypto queries
      const userQuestion = messages[messages.length - 1].content.toLowerCase();
      if (userQuestion.includes('nft') || userQuestion.includes('wallet') || userQuestion.includes('base') || userQuestion.includes('crypto')) {
        return "🔗 I'm ChainWhisper, your AI oracle for Base network analysis! While I'm currently connecting to my data sources, I can help you analyze:\n\n• NFT minting patterns and collections\n• Wallet behavior and risk assessment\n• DeFi protocol interactions\n• Gas optimization strategies\n• Token movement analysis\n\nPlease try your question again, or ask about specific wallet addresses or transactions you'd like me to investigate! 📊";
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};
