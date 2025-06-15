
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center">
            <Bot className="w-4 h-4 text-electric-blue-400" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          p-4 rounded-lg ${isUser 
            ? 'bg-electric-blue-500/20 border border-electric-blue-500/30 ml-auto' 
            : 'glass-card'
          }
        `}>
          <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <p className="text-xs text-gray-500 mt-1 px-2">
            {timestamp}
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-electric-blue-500/20 border border-electric-blue-500/30 flex items-center justify-center">
            <User className="w-4 h-4 text-electric-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
