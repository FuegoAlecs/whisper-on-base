
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
        text: `Here's what I found:\n\n${getMockResponse(inputValue)}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getMockResponse = (query: string) => {
    if (query.toLowerCase().includes("weather")) {
      return "🌤️ Current weather conditions:\n• Temperature: 72°F (22°C)\n• Conditions: Partly cloudy\n• Humidity: 65%\n• Wind: 8 mph SW";
    }
    if (query.toLowerCase().includes("news")) {
      return "📰 Latest headlines:\n• Tech: Apple announces new M4 chip\n• Markets: S&P 500 reaches new high\n• Science: Webb telescope discovers new exoplanet\n• Sports: World Cup qualifiers begin";
    }
    if (query.toLowerCase().includes("crypto")) {
      return "₿ Crypto market update:\n• Bitcoin: $43,250 (+2.1%)\n• Ethereum: $2,650 (+1.8%)\n• Market cap: $1.7T\n• Fear & Greed Index: 58 (Neutral)";
    }
    return "🤖 I'm Grok, your AI assistant. I can help with real-time information, analysis, and more. What would you like to know?";
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
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 lg:py-12 px-4">
            <div className="mb-6">
              <Sparkles className="h-10 w-10 lg:h-12 lg:w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Hi, I'm Grok</h3>
              <p className="text-gray-400 text-sm lg:text-base">A real-time AI assistant by xAI</p>
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

      <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-4 lg:p-6">
        <div className="flex gap-2 lg:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Grok anything..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg text-sm lg:text-base py-3 lg:py-4"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-lg transition-all duration-200"
          >
            <Send className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
