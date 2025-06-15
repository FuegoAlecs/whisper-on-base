
import { Button } from "@/components/ui/button";
import { Zap, Moon, Sun, Wallet } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-electric-blue-500 animate-pulse-glow" />
              <div className="absolute inset-0 h-8 w-8 bg-electric-blue-500/20 blur-xl rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white neon-text">ChainWhisper</h1>
              <p className="text-sm text-gray-400">Ask-Anything for Base Data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="glass border-white/20 hover:bg-white/10"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass border-electric-blue-500/30 text-electric-blue-400 hover:bg-electric-blue-500/10"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
