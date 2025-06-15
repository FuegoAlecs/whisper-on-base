
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import LoadingMessage from "./LoadingMessage";
import { useAnthropic } from "@/hooks/useAnthropic";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useAnthropic();
  const { toast } = useToast();

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
    const currentInput = inputValue;
    setInputValue("");

    try {
      const conversationHistory = messages.map(msg => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text
      }));

      conversationHistory.push({
        role: 'user' as const,
        content: currentInput
      });

      const aiResponse = await sendMessage(conversationHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Connection Issue",
        description: "There was a problem processing your message. Please try again!",
        variant: "default",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-2 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-4 sm:py-8 lg:py-12 px-2 sm:px-4">
            <div className="mb-3 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-500 mx-auto mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Hi, I'm ChainWhisper</h3>
              <p className="text-gray-400 text-xs sm:text-base">Your AI oracle for Base network data</p>
              <div className="mt-2 text-green-400 text-xs">
                Connected to Alchemy for real blockchain data analysis
              </div>
            </div>
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

      <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-2 sm:p-4 lg:p-6">
        <div className="flex gap-1.5 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about on-chain activity..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg text-xs sm:text-base py-1.5 sm:py-3 lg:py-4 px-2 sm:px-4"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-4 lg:px-6 py-1.5 sm:py-3 lg:py-4 rounded-lg transition-all duration-200 flex-shrink-0"
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
