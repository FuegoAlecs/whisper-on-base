
import { useState } from 'react';
import { useAlchemy } from './useAlchemy';

const USER_PROVIDED_GROQ_API_KEY_PLACEHOLDER = "PASTE_YOUR_GROQ_API_KEY_HERE_FOR_LOCAL_TESTING_ONLY";
// Important: Remind user not to commit this key.

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

const callGroqAPI = async (fullPrompt: string): Promise<string> => {
  console.log("[Debug Groq] Attempting to call Groq API.");

  // Extract System and User parts from the fullPrompt
  let systemContent = "";
  let userContent = fullPrompt; // Default to full prompt if no "System:" prefix

  const systemMatch = fullPrompt.match(/^System:(.*?)User:/s); // Non-greedy match for system
  if (systemMatch && systemMatch[1]) {
    systemContent = systemMatch[1].trim();
    userContent = fullPrompt.substring(systemMatch[0].length).trim(); // Get content after "System:...User:"
  } else {
    // Fallback if "System:" prefix is not found or "User:" is not after it.
    // Could also look for just "User:" if system part is truly optional by design.
    const userMatchOnly = fullPrompt.match(/^User:(.*)/s);
    if (userMatchOnly && userMatchOnly[1]) {
       userContent = userMatchOnly[1].trim();
    }
    // If neither, the whole prompt is treated as user content for simplicity here.
  }

  console.log("[Debug Groq] System Content (first 100):", systemContent.substring(0,100));
  console.log("[Debug Groq] User Content (first 100):", userContent.substring(0,100));

  const messages = [];
  if (systemContent) {
    messages.push({ role: "system", content: systemContent });
  }
  messages.push({ role: "user", content: userContent });

  const groqPayload = {
    model: "llama-3.1-8b-instant", // As decided
    messages: messages,
    temperature: 0.7,       // Optional: common default
    max_tokens: 1500,       // Optional: adjust as needed
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_PROVIDED_GROQ_API_KEY_PLACEHOLDER}`
      },
      body: JSON.stringify(groqPayload)
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Use text() first to avoid JSON parse error if body is not JSON
      console.error("[Error Groq] API call failed:", response.status, response.statusText, errorBody);
      return `Error from Groq API: ${response.status} ${response.statusText}. Details: ${errorBody}`;
    }

    const data = await response.json();
    // console.log("[Debug Groq] Raw API Response:", JSON.stringify(data, null, 2)); // For deep debugging

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      console.log("[Debug Groq] Successfully received response from Groq.");
      return data.choices[0].message.content;
    } else {
      console.error("[Error Groq] Invalid response structure from API:", data);
      return "Error: Received an invalid response structure from Groq API.";
    }

  } catch (error: any) {
    console.error("[Error Groq] Fetch error:", error);
    return `Network or other error when calling Groq API: ${error.message}`;
  }
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
            const aiResponse = await callGroqAPI(prompt);
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
