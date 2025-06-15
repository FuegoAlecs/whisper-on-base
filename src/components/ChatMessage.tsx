
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 mb-4 lg:mb-6 ${isUser ? 'justify-end' : 'justify-start'} px-2 lg:px-0`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-orange-600 flex items-center justify-center">
            <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] lg:max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          p-3 lg:p-4 rounded-lg text-sm lg:text-base ${isUser 
            ? 'bg-gray-800 border border-gray-700 ml-auto' 
            : 'bg-gray-900/50 border border-gray-800'
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
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
            <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
