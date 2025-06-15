
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
      // Use your provided API key as default
      const token = apiKey || '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';
      
      // Use Hugging Face's text generation inference API with a reliable model
      const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inputs: messages[messages.length - 1].content,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        // If the first model fails, try a simpler backup model
        const backupResponse = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-small', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            inputs: `Answer this question: ${messages[messages.length - 1].content}`,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7
            }
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
