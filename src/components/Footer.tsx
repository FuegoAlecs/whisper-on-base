
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Built with</span>
            <div className="flex items-center gap-2">
              <img 
                src="https://docs.base.org/img/favicon.ico" 
                alt="Base" 
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>Base</span>
            </div>
            <span>•</span>
            <span>ChainWhisper</span>
            <span>•</span>
            <span>Alchemy</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-electric-blue-400 transition-colors"
            >
              Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-electric-blue-400 transition-colors"
            >
              API
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="#" 
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-electric-blue-400 transition-colors"
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
