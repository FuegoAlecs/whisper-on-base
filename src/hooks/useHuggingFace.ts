
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
      
      // Provide a more generic fallback that acknowledges the actual question
      const userQuestion = messages[messages.length - 1].content;
      return `I'm experiencing some technical difficulties connecting to my AI models right now. I see you asked: "${userQuestion}"\n\nI'd be happy to help answer that, but I'm currently unable to process your request properly. Please try asking again in a moment, or rephrase your question and I'll do my best to assist you!`;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};
