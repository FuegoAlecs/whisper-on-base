
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header = ({ onSidebarToggle }: HeaderProps) => {
  return (
    <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="relative">
              <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">Grok</h1>
              <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">Real-time AI for everything</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
