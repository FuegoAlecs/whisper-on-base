
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
        text: `Based on Base network data analysis:\n\n${getMockResponse(inputValue)}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const getMockResponse = (query: string) => {
    if (query.toLowerCase().includes("nft")) {
      return "🎨 Top NFT Activity on Base:\n• 0x1234...5678 minted 127 NFTs (most active)\n• Total mints in last hour: 1,243\n• Popular collections: BaseApes, ChainPunks\n• Average mint cost: 0.003 ETH";
    }
    if (query.toLowerCase().includes("gas")) {
      return "⛽ Gas Usage Analysis:\n• Current Base gas price: 0.25 gwei\n• Top spenders:\n  - 0xabcd...efgh: 2.3 ETH in fees\n  - 0x9876...5432: 1.8 ETH in fees\n• Average transaction cost: $0.12";
    }
    if (query.toLowerCase().includes("tornado")) {
      return "🔍 Tornado Cash Analysis:\n• Address flagged: ❌ No direct interactions\n• Privacy score: Low risk\n• Last checked: 2 minutes ago\n• Compliance status: Clean";
    }
    return "📊 Base Network Insights:\n• Current block: 8,234,567\n• Active wallets today: 45,678\n• Total transactions: 2.1M\n• Network health: 🟢 Excellent";
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Sparkles className="h-12 w-12 text-electric-blue-400 mx-auto mb-4 animate-pulse-glow" />
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to ChainWhisper</h3>
              <p className="text-gray-400">Ask me anything about Base network activity</p>
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

      <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about on-chain activity..."
              className="glass border-white/20 bg-white/5 text-white placeholder-gray-400 pr-12 focus:border-electric-blue-500 focus:ring-electric-blue-500/20"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-electric-blue-500 hover:bg-electric-blue-600 text-white px-6 neon-glow transition-all duration-300"
          >
            <Send className="h-4 w-4 mr-2" />
            Whisper
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
