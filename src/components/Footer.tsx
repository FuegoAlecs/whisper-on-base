
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-4">
          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-400">
            <span>Built by xAI</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Grok</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Real-time AI</span>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs lg:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              About
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs lg:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              API
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-xs lg:text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
