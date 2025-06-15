
import { Bot } from "lucide-react";

const LoadingMessage = () => {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center">
          <Bot className="w-4 h-4 text-electric-blue-400 animate-pulse" />
        </div>
      </div>
      
      <div className="max-w-[80%]">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-electric-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-electric-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-electric-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-gray-400 text-sm">ChainWhisper is thinking...</span>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-electric-blue-500/30 to-transparent animate-shimmer relative" />
            </div>
            <div className="h-2 bg-gray-700 rounded-full w-3/4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-electric-blue-500/30 to-transparent animate-shimmer relative" style={{ animationDelay: '500ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
