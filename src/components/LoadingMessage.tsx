
import { Bot } from "lucide-react";

const LoadingMessage = () => {
  return (
    <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6 justify-start px-1 sm:px-2 lg:px-0">
      <div className="flex-shrink-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-orange-600 flex items-center justify-center">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white animate-pulse" />
        </div>
      </div>
      
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
        <div className="bg-gray-900/50 border border-gray-800 p-2 sm:p-3 lg:p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm">ChainWhisper is analyzing...</span>
          </div>
          
          <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-pulse relative" />
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-full w-3/4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-pulse relative" style={{ animationDelay: '500ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
