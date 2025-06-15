
import { Button } from "@/components/ui/button";
import { Zap, Menu } from "lucide-react";

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header = ({ onSidebarToggle }: HeaderProps) => {
  return (
    <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white">ChainWhisper</h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden xs:block">Ask-Anything for Base Data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
