
import { useState } from 'react';
import { useAlchemy } from './useAlchemy';

const USER_PROVIDED_GROQ_API_KEY_PLACEHOLDER = "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";
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
  const { analyzeWallet, getRecentNftMints, isLoading: alchemyLoading } = useAlchemy();

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
      } else {
      const lowerUserQuery = messages[messages.length - 1].content.toLowerCase().trim();

      // Intent detection for recent NFT mints
      const nftMintKeywords = [
        "recent mints", "latest mints", "newly minted",
        "recent nfts", "latest nfts", "who minted recently",
        "wallet address recently minted", "mints on base",
        "minting activity", "show me new mints", "any new mints",
        "latest minting"
      ];
      if (nftMintKeywords.some(keyword => lowerUserQuery.includes(keyword))) {
        console.log("[Debug Intent] Detected intent for recent NFT mints.");
        try {
          // setIsLoading(true); // Already set at the start of sendMessage
          const mints = await getRecentNftMints({ limit: 7 }); // Fetch, e.g., last 7 mints

          let mintsDataString = "No recent mints found or data is unavailable.";
          if (mints && mints.length > 0) {
            mintsDataString = mints.map(mint =>
              `- Tx: ${mint.transactionHash.substring(0, 10)}..., Minter: ${mint.minterAddress}, NFT Contract: ${mint.nftContractAddress || 'N/A'}, TokenID: ${mint.tokenId ? mint.tokenId.substring(0,5) : 'N/A'}, Collection: ${mint.collectionName || '[Name Missing]'}`
            ).join('\n');
          }

          const userQueryForPrompt = messages[messages.length - 1].content;
          const systemPromptForNftMints = `You are ChainWhisper, an AI assistant. The user asked about recent NFT mints on Base. You have been provided with a list of recent mint events. Present this information clearly and conversationally. If no mints were found, state that. After listing the mints, you can offer to analyze one of the minter addresses or NFT contract addresses if the user provides one.`;

          const promptForNftMints = `
System: ${systemPromptForNftMints}

User: My query was: "${userQueryForPrompt}"

Here are the recent NFT mint events fetched from the Base network:
${mintsDataString}
---

Please summarize these recent mints for me.
`;
          // console.log("[Debug Groq] NFT Mints Prompt:", promptForNftMints); // Optional for debugging
          const aiResponse = await callGroqAPI(promptForNftMints);
          return aiResponse;

        } catch (error) {
          console.error("[Error App] Failed to fetch or process NFT mints:", error);
          return "Sorry, I encountered an error while trying to fetch recent NFT mints. Please try again later.";
        }
      }
      // ELSE, if not NFT mint intent, it will fall through to the existing general query handler below this block:
      // NEW LOGIC FOR GENERAL QUERIES:
      console.log("[Debug Groq] No wallet address detected. Routing general query to Groq.");
      const userQuery = messages[messages.length - 1].content; // Get the full user query

      const generalQuerySystemPrompt = "You are ChainWhisper, an AI assistant knowledgeable about the Base blockchain and general crypto concepts. The user has a general question. Please answer conversationally and helpfully. If the question asks for specific, real-time, aggregate on-chain statistics you don't have direct access to (e.g., 'how many NFTs were minted today across the whole network?'), politely explain your current primary capability is analyzing specific wallet addresses when provided, and that you can answer conceptual questions, but you cannot provide that specific live aggregate statistic. You can offer to analyze a specific address if the user provides one.";
      
      const promptForGeneralQuery = `
System: ${generalQuerySystemPrompt}

User: My question is: "${userQuery}"
`;
      // console.log("[Debug Groq] General Query Prompt:", promptForGeneralQuery); // Optional for debugging

      // It's important to call setIsLoading(true) here if it wasn't set at the start of sendMessage for all paths.
      // Assuming setIsLoading(true) is already called at the beginning of sendMessage.
      // If not, it should be: setIsLoading(true);

      const aiResponse = await callGroqAPI(promptForGeneralQuery); // Use existing callGroqAPI
      return aiResponse;
    }
      
    } catch (error) {
      console.error('Chat error:', error);
      return "I'm having trouble processing your request right now. Please try again in a moment!";
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading: isLoading || alchemyLoading };
};
