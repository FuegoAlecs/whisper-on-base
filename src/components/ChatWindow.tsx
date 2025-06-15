import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import LoadingMessage from "./LoadingMessage";
import QueryExamples from "./QueryExamples";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Here's what I found on Base:\n\n${getMockResponse(inputValue)}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getMockResponse = (query: string) => {
    if (query.toLowerCase().includes("nft")) {
      return "🎨 NFT Activity Analysis:\n• 1,247 NFTs minted in the last hour\n• Top collection: BasePunks (234 mints)\n• Average mint price: 0.05 ETH\n• Most active wallet: 0x742d...8f3a (12 mints)";
    }
    if (query.toLowerCase().includes("gas")) {
      return "⛽ Gas Tracker:\n• Current Base gas: 0.23 gwei\n• Top gas spender: 0x1a2b...9c8d (2.1 ETH fees)\n• Average transaction cost: $0.12\n• Peak usage: 14:30 UTC (1.2M gas/block)";
    }
    if (query.toLowerCase().includes("tornado")) {
      return "🌪️ Tornado Cash Analysis:\n• Address flagged: Yes\n• Last interaction: 2023-08-15\n• Risk score: High\n• Mixer volume: 150.5 ETH";
    }
    return "🔍 ChainWhisper Analysis:\nI'm your AI oracle for Base network data. Ask me about NFTs, DeFi, wallets, or any on-chain activity and I'll analyze it for you.";
  };

  const handleExampleClick = (query: string) => {
    setInputValue(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6 sm:py-8 lg:py-12 px-3 sm:px-4">
            <div className="mb-4 sm:mb-6">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Hi, I'm ChainWhisper</h3>
              <p className="text-gray-400 text-sm sm:text-base">Your AI oracle for Base network data</p>
            </div>
            <QueryExamples onExampleClick={handleExampleClick} />
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {isLoading && <LoadingMessage />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6">
        <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about on-chain activity..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg text-sm sm:text-base py-2 sm:py-3 lg:py-4 px-3 sm:px-4"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline ml-2">Whisper</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
