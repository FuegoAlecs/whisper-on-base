
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-2 sm:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span>Built with Alchemy</span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline">ChainWhisper on Base</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">AI Oracle</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              Base
              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              API
              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              GitHub
              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
